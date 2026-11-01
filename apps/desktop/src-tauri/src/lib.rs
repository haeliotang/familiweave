use rusqlite::Connection;
use serde::Serialize;
use std::{fs, path::PathBuf, sync::Mutex};
use tauri::{Manager, State};

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
fn db_status(state: State<'_, DbState>) -> Result<DbStatus, String> {
  let connection = state.connection.lock().map_err(|error| error.to_string())?;
  let tables: i64 = connection
    .query_row("SELECT count(*) FROM sqlite_master WHERE type = 'table'", [], |row| row.get(0))
    .map_err(|error| error.to_string())?;
  Ok(DbStatus { path: state.path.to_string_lossy().into_owned(), ready: true, tables })
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
         );",
      )?;
      app.manage(DbState { path: database_path, connection: Mutex::new(connection) });

      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![host_info, read_local_text, write_local_text, db_status])
    .run(tauri::generate_context!())
    .expect("error while running Familiweave");
}

#[cfg(test)]
mod tests {
  use super::sandbox_file_name;

  #[test]
  fn sandbox_accepts_plain_file_names() {
    assert!(sandbox_file_name("export.json").is_ok());
    assert!(sandbox_file_name("2026-11-01_motif.json").is_ok());
  }

  #[test]
  fn sandbox_rejects_paths_and_hidden_names() {
    for name in ["", "../x", "a/b", "a\\b", ".env", "..", "a..b"] {
      assert!(sandbox_file_name(name).is_err(), "accepted {name:?}");
    }
    assert!(sandbox_file_name(&"a".repeat(121)).is_err());
  }
}
