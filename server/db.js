const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'sparkflow.db');

let _db = null;

function saveToDisk(sqlDb) {
  const data = sqlDb.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Creates a better-sqlite3-compatible synchronous API wrapper around sql.js
function wrap(sqlDb) {
  const persist = () => saveToDisk(sqlDb);

  return {
    exec(sql) {
      sqlDb.exec(sql);
      persist();
    },
    prepare(sql) {
      return {
        get(...args) {
          const stmt = sqlDb.prepare(sql);
          const params = args.flat();
          if (params.length) stmt.bind(params);
          let row = null;
          if (stmt.step()) row = stmt.getAsObject();
          stmt.free();
          return row;
        },
        all(...args) {
          const stmt = sqlDb.prepare(sql);
          const params = args.flat();
          if (params.length) stmt.bind(params);
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
        run(...args) {
          const stmt = sqlDb.prepare(sql);
          const params = args.flat();
          stmt.run(params.length ? params : []);
          stmt.free();
          const lid = sqlDb.exec('SELECT last_insert_rowid()')[0]?.values?.[0]?.[0] ?? null;
          const chg = sqlDb.exec('SELECT changes()')[0]?.values?.[0]?.[0] ?? 0;
          persist();
          return { lastInsertRowid: lid, changes: Number(chg) };
        },
      };
    },
  };
}

async function init() {
  const SQL = await initSqlJs();

  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    sqlDb = new SQL.Database();
  }

  const db = wrap(sqlDb);

  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT,
      industry TEXT,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      primary_service TEXT,
      secondary_service TEXT,
      package_value REAL,
      outreach_channel TEXT,
      date_contacted TEXT,
      outreach_status TEXT,
      followup_date TEXT,
      followup_method TEXT,
      response_received TEXT,
      meeting_scheduled TEXT,
      proposal_sent TEXT,
      deal_status TEXT DEFAULT 'Prospecting',
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'caller',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount && userCount.count === 0) {
    const adminHash = await bcrypt.hash('admin1234', 10);
    const callerHash = await bcrypt.hash('caller1234', 10);
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)').run('Admin', 'admin@sparkflow.pk', adminHash, 'admin');
    db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)').run('Caller', 'caller@sparkflow.pk', callerHash, 'caller');
    console.log('Seeded admin and caller users.');
  }

  saveToDisk(sqlDb);
  _db = db;
  return db;
}

function getDb() {
  if (!_db) throw new Error('Database not initialized');
  return _db;
}

module.exports = { init, getDb };
