use rusqlite::Connection;
use serde::Serialize;
use serde_json::{Value, json};
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{Manager, State};

#[cfg(test)]
const LOCAL_STATE_SCHEMA: &str = "CREATE TABLE IF NOT EXISTS local_state (\n  key TEXT PRIMARY KEY,\n  value TEXT NOT NULL,\n  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP\n);";

fn read_snapshot(connection: &Connection) -> Result<Value, String> {
    let mut statement = connection
        .prepare("SELECT key, value FROM local_state WHERE key IN ('motifs', 'relationships')")
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|error| error.to_string())?;
    let mut motifs = Value::Array(Vec::new());
    let mut relationships = Value::Array(Vec::new());
    for row in rows {
        let (key, value) = row.map_err(|error| error.to_string())?;
        let parsed: Value = serde_json::from_str(&value).map_err(|error| error.to_string())?;
        if key == "motifs" {
            motifs = parsed;
        } else if key == "relationships" {
            relationships = parsed;
        }
    }
    Ok(json!({ "motifs": motifs, "relationships": relationships }))
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
    let statement = "INSERT INTO local_state (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP";
    connection
        .execute(
            statement,
            [
                "motifs",
                &serde_json::to_string(motifs).map_err(|error| error.to_string())?,
            ],
        )
        .map_err(|error| error.to_string())?;
    connection
        .execute(
            statement,
            [
                "relationships",
                &serde_json::to_string(relationships).map_err(|error| error.to_string())?,
            ],
        )
        .map_err(|error| error.to_string())?;
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let data = app.path().app_data_dir()?;
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
            &json!({ "motifs": [{"name":"a"}], "relationships": [] }),
        )
        .unwrap();
        let snapshot = read_snapshot(&connection).unwrap();
        assert_eq!(snapshot["motifs"][0]["name"], "a");
        assert_eq!(snapshot["relationships"].as_array().unwrap().len(), 0);
    }

    #[test]
    fn local_state_rejects_malformed_snapshots() {
        let connection = Connection::open_in_memory().unwrap();
        connection.execute_batch(super::LOCAL_STATE_SCHEMA).unwrap();
        assert!(write_snapshot(&connection, &json!({ "motifs": [] })).is_err());
    }

    #[test]
    fn sandbox_rejects_paths_and_hidden_names() {
        for name in ["", "../x", "a/b", "a\\b", ".env", "..", "a..b"] {
            assert!(sandbox_file_name(name).is_err(), "accepted {name:?}");
        }
        assert!(sandbox_file_name(&"a".repeat(121)).is_err());
    }
}
