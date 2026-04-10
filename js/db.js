import Database from "better-sqlite3";

// Creates file if it doesn't exist
const db = new Database("gallery.db");

// Create table
db.prepare(`
  CREATE TABLE IF NOT EXISTS images (
	id	INTEGER PRIMARY KEY AUTOINCREMENT,
	title	TEXT,
	artist_name	TEXT,
	artist_country	TEXT,
	artist_year	TEXT,
	year	INTEGER,
	description	TEXT,
	page_url	TEXT,
	filename	TEXT,
	overall_width	REAL,
	overall_height	REAL,
	framed_width	REAL,
	framed_height	REAL
)
`).run();

export default db;

