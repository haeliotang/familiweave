use rusqlite::Connection;
use serde::Serialize;
use serde_json::{Value, json};
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::{Manager, State};

#[cfg(test)]
const LOCAL_STATE_SCHEMA: &str = "CREATE TABLE IF NOT EXISTS local_state (\n  key TEXT PRIMARY KEY,\n  value TEXT NOT NULL,\n  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP\n);";
const DATABASE_SCHEMA_VERSION: i64 = 2;

fn read_snapshot(connection: &Connection) -> Result<Value, String> {
    let mut statement = connection
        .prepare(
            "SELECT key, value FROM local_state WHERE key IN ('motifs', 'relationships', 'field', 'signals', 'captures')",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| error.to_string())?;
    let mut motifs = Value::Array(Vec::new());
    let mut relationships = Value::Array(Vec::new());
    let mut field = json!({ "version": "field-layout-v1", "positions": {}, "links": [] });
    let mut signals = Value::Array(Vec::new());
    let mut captures = Value::Array(Vec::new());
    for row in rows {
        let (key, value) = row.map_err(|error| error.to_string())?;
        let parsed: Value = serde_json::from_str(&value).map_err(|error| error.to_string())?;
        if key == "motifs" {
            motifs = parsed;
        } else if key == "relationships" {
            relationships = parsed;
        } else if key == "field" {
            field = parsed;
        } else if key == "signals" {
            signals = parsed;
        } else if key == "captures" {
            captures = parsed;
        }
    }
    Ok(
        json!({ "motifs": motifs, "relationships": relationships, "field": field, "signals": signals, "captures": captures }),
    )
}

fn write_snapshot(connection: &Connection, snapshot: &Value) -> Result<(), String> {
    let motifs = snapshot
        .get("motifs")
        .and_then(Value::as_array)
        .ok_or("invalid_motifs")?;
    let relationships = snapshot
        .get("relationships")
        .and_then(Value::as_array)
        .ok_or("invalid_relationships")?;
    let field = snapshot
        .get("field")
        .cloned()
        .unwrap_or_else(|| json!({ "version": "field-layout-v1", "positions": {}, "links": [] }));
    let signals = snapshot
        .get("signals")
        .cloned()
        .unwrap_or_else(|| Value::Array(Vec::new()));
    let captures = snapshot
        .get("captures")
        .cloned()
        .unwrap_or_else(|| Value::Array(Vec::new()));
    if field.get("version").and_then(Value::as_str) != Some("field-layout-v1")
        || !field
            .get("positions")
            .map(Value::is_object)
            .unwrap_or(false)
        || !field.get("links").map(Value::is_array).unwrap_or(false)
    {
        return Err("invalid_field".into());
    }
    if !signals.is_array() {
        return Err("invalid_signals".into());
    }
    if !captures.is_array() {
        return Err("invalid_captures".into());
    }
    let statement = "INSERT INTO local_state (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP";
    connection
        .execute("DELETE FROM local_state WHERE key = 'encrypted'", [])
        .map_err(|error| error.to_string())?;
    for (key, value) in [
        ("motifs", Value::Array(motifs.clone())),
        ("relationships", Value::Array(relationships.clone())),
        ("field", field),
        ("signals", signals),
        ("captures", captures),
    ] {
        connection
            .execute(
                statement,
                [
                    key,
                    &serde_json::to_string(&value).map_err(|error| error.to_string())?,
                ],
            )
            .map_err(|error| error.to_string())?;
    }
    Ok(())
}

struct DbState {
    path: PathBuf,
    connection: Mutex<Connection>,
}

#[derive(Serialize)]
struct HostInfo {
    platform: String,
    app_version: String,
    app_data_dir: String,
    database_path: String,
    sandbox: String,
}

#[derive(Serialize)]
struct DbStatus {
    path: String,
    ready: bool,
    tables: i64,
}

fn app_data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|error| error.to_string())
}

fn sandbox_file_name(name: &str) -> Result<&str, String> {
    if name.is_empty()
        || name.len() > 120
        || name.starts_with('.')
        || name.contains('/')
        || name.contains('\\')
        || name.contains("..")
    {
        return Err("invalid_local_file_name".into());
    }
    Ok(name)
}

#[tauri::command]
fn host_info(app: tauri::AppHandle, state: State<'_, DbState>) -> Result<HostInfo, String> {
    let data = app_data_dir(&app)?;
    Ok(HostInfo {
        platform: std::env::consts::OS.to_string(),
        app_version: app.package_info().version.to_string(),
        app_data_dir: data.to_string_lossy().into_owned(),
        database_path: state.path.to_string_lossy().into_owned(),
        sandbox: "app-data-only".into(),
    })
}

#[tauri::command]
fn read_local_text(app: tauri::AppHandle, name: String) -> Result<String, String> {
    let name = sandbox_file_name(&name)?;
    let path = app_data_dir(&app)?.join("local-files").join(name);
    let metadata = fs::metadata(&path).map_err(|error| error.to_string())?;
    if metadata.len() > 1_048_576 {
        return Err("local_file_too_large".into());
    }
    fs::read_to_string(path).map_err(|error| error.to_string())
}

#[tauri::command]
fn write_local_text(app: tauri::AppHandle, name: String, contents: String) -> Result<(), String> {
    if contents.len() > 1_048_576 {
        return Err("local_file_too_large".into());
    }
    let name = sandbox_file_name(&name)?;
    let directory = app_data_dir(&app)?.join("local-files");
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    fs::write(directory.join(name), contents).map_err(|error| error.to_string())
}

#[tauri::command]
fn load_local_state(state: State<'_, DbState>) -> Result<Value, String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    read_snapshot(&connection)
}

#[tauri::command]
fn save_local_state(state: State<'_, DbState>, snapshot: Value) -> Result<(), String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    write_snapshot(&connection, &snapshot)
}

#[tauri::command]
fn clear_local_state(state: State<'_, DbState>) -> Result<(), String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    connection
        .execute("DELETE FROM local_state", [])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn export_local_state(app: tauri::AppHandle, state: State<'_, DbState>) -> Result<String, String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    let snapshot = read_snapshot(&connection)?;
    let directory = app_data_dir(&app)?.join("local-files");
    fs::create_dir_all(&directory).map_err(|error| error.to_string())?;
    let seconds = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|error| error.to_string())?
        .as_secs();
    let name = format!("familiweave-export-{seconds}.json");
    fs::write(
        directory.join(&name),
        serde_json::to_string_pretty(&snapshot).map_err(|error| error.to_string())?,
    )
    .map_err(|error| error.to_string())?;
    Ok(name)
}

#[tauri::command]
fn import_local_state(
    app: tauri::AppHandle,
    state: State<'_, DbState>,
    name: String,
) -> Result<Value, String> {
    let name = sandbox_file_name(&name)?;
    let path = app_data_dir(&app)?.join("local-files").join(name);
    let text = fs::read_to_string(path).map_err(|error| error.to_string())?;
    let snapshot: Value = serde_json::from_str(&text).map_err(|error| error.to_string())?;
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    write_snapshot(&connection, &snapshot)?;
    Ok(snapshot)
}

fn read_encrypted_state(connection: &Connection) -> Result<Option<String>, String> {
    let mut statement = connection
        .prepare("SELECT value FROM local_state WHERE key = 'encrypted'")
        .map_err(|error| error.to_string())?;
    let mut rows = statement.query([]).map_err(|error| error.to_string())?;
    let row = rows.next().map_err(|error| error.to_string())?;
    row.map(|row| row.get::<_, String>(0))
        .transpose()
        .map_err(|error| error.to_string())
}

fn write_encrypted_state(connection: &Connection, payload: &str) -> Result<(), String> {
    connection
        .execute(
            "INSERT INTO local_state (key, value) VALUES ('encrypted', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
            [payload],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute(
            "DELETE FROM local_state WHERE key IN ('motifs', 'relationships', 'field', 'signals', 'captures')",
            [],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn remove_encrypted_state(connection: &Connection) -> Result<(), String> {
    connection
        .execute("DELETE FROM local_state WHERE key = 'encrypted'", [])
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn load_encrypted_state(state: State<'_, DbState>) -> Result<Option<String>, String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    read_encrypted_state(&connection)
}

#[tauri::command]
fn save_encrypted_state(state: State<'_, DbState>, payload: String) -> Result<(), String> {
    if payload.len() > 20_000_000 {
        return Err("encrypted_state_too_large".into());
    }
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    write_encrypted_state(&connection, &payload)
}

#[tauri::command]
fn clear_encrypted_state(state: State<'_, DbState>) -> Result<(), String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    remove_encrypted_state(&connection)
}

#[tauri::command]
fn db_status(state: State<'_, DbState>) -> Result<DbStatus, String> {
    let connection = state.connection.lock().map_err(|error| error.to_string())?;
    let tables: i64 = connection
        .query_row(
            "SELECT count(*) FROM sqlite_master WHERE type = 'table'",
            [],
            |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
    Ok(DbStatus {
        path: state.path.to_string_lossy().into_owned(),
        ready: true,
        tables,
    })
}

fn copy_legacy_file(source: &Path, destination: &Path) -> Result<(), std::io::Error> {
    if source.is_file() && !destination.exists() {
        if let Some(parent) = destination.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::copy(source, destination)?;
    }
    Ok(())
}

fn legacy_app_data_dir(data: &Path) -> Option<PathBuf> {
    let parent = data.parent()?;
    let name = data.file_name()?.to_string_lossy();
    if !name.contains("inceptless") {
        return None;
    }
    // The corrected identifier differs from the legacy identifier by one "n".
    Some(parent.join(name.replacen("in", "i", 1)))
}

fn migrate_legacy_app_data(data: &Path) -> Result<(), std::io::Error> {
    let Some(legacy) = legacy_app_data_dir(data) else {
        return Ok(());
    };
    if legacy == data || !legacy.is_dir() {
        return Ok(());
    }
    fs::create_dir_all(data)?;
    if !data.join("familiweave.db").exists() {
        copy_legacy_file(&legacy.join("familiweave.db"), &data.join("familiweave.db"))?;
    }
    let legacy_files = legacy.join("local-files");
    if legacy_files.is_dir() {
        for entry in fs::read_dir(legacy_files)? {
            let entry = entry?;
            if entry.file_type()?.is_file() {
                copy_legacy_file(
                    &entry.path(),
                    &data.join("local-files").join(entry.file_name()),
                )?;
            }
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data = app.path().app_data_dir()?;
            if let Err(error) = migrate_legacy_app_data(&data) {
                eprintln!("legacy app-data migration skipped: {error}");
            }
            fs::create_dir_all(&data)?;
            let database_path = data.join("familiweave.db");
            let connection = Connection::open(&database_path)?;
            connection.execute_batch(
                "CREATE TABLE IF NOT EXISTS local_meta (
           key TEXT PRIMARY KEY,
           value TEXT NOT NULL,
           updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
         );
         CREATE TABLE IF NOT EXISTS local_state (
           key TEXT PRIMARY KEY,
           value TEXT NOT NULL,
           updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
         );",
            )?;
            connection.execute(
                "INSERT INTO local_meta (key, value) VALUES ('schema_version', ?1) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP",
                [DATABASE_SCHEMA_VERSION.to_string()],
            )?;
            app.manage(DbState {
                path: database_path,
                connection: Mutex::new(connection),
            });

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            host_info,
            read_local_text,
            write_local_text,
            db_status,
            load_local_state,
            save_local_state,
            clear_local_state,
            load_encrypted_state,
            save_encrypted_state,
            clear_encrypted_state,
            export_local_state,
            import_local_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running Familiweave");
}

#[cfg(test)]
mod tests {
    use super::{read_snapshot, sandbox_file_name, write_snapshot};
    use rusqlite::Connection;
    use serde_json::json;

    #[test]
    fn sandbox_accepts_plain_file_names() {
        assert!(sandbox_file_name("export.json").is_ok());
        assert!(sandbox_file_name("2026-11-01_motif.json").is_ok());
    }

    #[test]
    fn local_state_round_trips_through_sqlite() {
        let connection = Connection::open_in_memory().unwrap();
        connection.execute_batch(super::LOCAL_STATE_SCHEMA).unwrap();
        write_snapshot(
            &connection,
            &json!({ "motifs": [{"name":"a"}], "relationships": [], "field": { "version": "field-layout-v1", "positions": { "motif:a": { "x": 0.2, "y": 0.4 } }, "links": [] }, "captures": [{ "version": "capture-v1", "captureId": "capture-1", "rendererKind": "captured", "mimeType": "video/mp4", "durationSec": 75, "sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "synthId": false, "createdAt": "2026-11-01T00:00:00.000Z" }] }),
        )
        .unwrap();
        let snapshot = read_snapshot(&connection).unwrap();
        assert_eq!(snapshot["motifs"][0]["name"], "a");
        assert_eq!(snapshot["relationships"].as_array().unwrap().len(), 0);
        assert_eq!(snapshot["field"]["positions"]["motif:a"]["x"], 0.2);
        assert_eq!(snapshot["signals"].as_array().unwrap().len(), 0);
        assert_eq!(snapshot["captures"][0]["captureId"], "capture-1");
    }

    #[test]
    fn local_state_rejects_malformed_snapshots() {
        let connection = Connection::open_in_memory().unwrap();
        connection.execute_batch(super::LOCAL_STATE_SCHEMA).unwrap();
        assert!(write_snapshot(&connection, &json!({ "motifs": [] })).is_err());
        assert!(
            write_snapshot(
                &connection,
                &json!({ "motifs": [], "relationships": [], "field": { "version": "nope" } })
            )
            .is_err()
        );
    }

    #[test]
    fn sandbox_rejects_paths_and_hidden_names() {
        for name in ["", "../x", "a/b", "a\\b", ".env", "..", "a..b"] {
            assert!(sandbox_file_name(name).is_err(), "accepted {name:?}");
        }
        assert!(sandbox_file_name(&"a".repeat(121)).is_err());
    }
    #[test]
    fn encrypted_state_replaces_plaintext_keys_and_round_trips() {
        let connection = Connection::open_in_memory().unwrap();
        connection.execute_batch(super::LOCAL_STATE_SCHEMA).unwrap();
        super::write_snapshot(
            &connection,
            &json!({ "motifs": [{"name":"a"}], "relationships": [] }),
        )
        .unwrap();
        super::write_encrypted_state(&connection, "ciphertext").unwrap();
        assert_eq!(
            super::read_encrypted_state(&connection).unwrap(),
            Some("ciphertext".into())
        );
        let plaintext: i64 = connection.query_row("SELECT count(*) FROM local_state WHERE key IN ('motifs','relationships','field','signals','captures')", [], |row| row.get(0)).unwrap();
        assert_eq!(plaintext, 0);
        super::remove_encrypted_state(&connection).unwrap();
        assert_eq!(super::read_encrypted_state(&connection).unwrap(), None);
    }

    #[test]
    fn migrates_legacy_app_data_into_the_corrected_bundle_id() {
        let root = std::env::temp_dir().join(format!(
            "familiweave-migration-{}",
            std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ));
        let current = root.join("com.inceptless.familiweave");
        let legacy = super::legacy_app_data_dir(&current).unwrap();
        std::fs::create_dir_all(legacy.join("local-files")).unwrap();
        std::fs::write(legacy.join("familiweave.db"), b"legacy-db").unwrap();
        std::fs::write(legacy.join("local-files/note.json"), b"{\"ok\":true}").unwrap();

        super::migrate_legacy_app_data(&current).unwrap();

        assert_eq!(
            std::fs::read(current.join("familiweave.db")).unwrap(),
            b"legacy-db"
        );
        assert_eq!(
            std::fs::read(current.join("local-files/note.json")).unwrap(),
            b"{\"ok\":true}"
        );
        let _ = std::fs::remove_dir_all(root);
    }
}
