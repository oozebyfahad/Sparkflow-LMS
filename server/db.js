const initSqlJs = require('sql.js');
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
      website_score INTEGER,
      social_score INTEGER,
      branding_score INTEGER,
      video_score INTEGER,
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

  const count = db.prepare('SELECT COUNT(*) as count FROM leads').get();
  if (count && count.count === 0) {
    const ins = db.prepare(`
      INSERT INTO leads (
        business_name, industry, website_score, social_score, branding_score, video_score,
        contact_name, email, phone, primary_service, secondary_service, package_value,
        outreach_channel, date_contacted, outreach_status, followup_date, followup_method,
        response_received, meeting_scheduled, proposal_sent, deal_status, notes
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `);

    const seeds = [
      ['Peak Digital Solutions', 'Marketing', 8, 7, 6, 5, 'Sarah Johnson', 'sarah@peakdigital.com', '0300-1234567', 'Social Media Management', 'SEO', 85000, 'Cold Call', '2026-06-10', 'Replied', '2026-06-25', 'Email', 'Yes', 'Yes', 'Yes', 'Closed Won', 'Signed 6-month contract. Great fit for our agency.'],
      ['Sunset Realty Group', 'Real Estate', 6, 5, 7, 3, 'Ahmed Khan', 'ahmed@sunsetrealty.pk', '0321-9876543', 'Video Production', 'Social Media Management', 120000, 'Email', '2026-06-15', 'Replied', '2026-07-03', 'Call', 'Yes', 'Yes', 'Yes', 'Proposal Sent', 'Waiting on budget approval from management board.'],
      ['FreshBite Catering Co.', 'Food & Beverage', 5, 8, 6, 4, 'Maria Santos', 'maria@freshbite.pk', '0333-5556677', 'Social Media Management', 'Photography', 45000, 'Instagram DM', '2026-06-18', 'Replied', '2026-07-01', 'Call', 'Yes', 'Yes', 'No', 'Meeting Set', 'Meeting confirmed. They want full social package.'],
      ['TechCore Solutions', 'Technology', 7, 6, 8, 2, 'Usman Ali', 'usman@techcore.pk', '0312-4445566', 'Website Redesign', 'SEO', 200000, 'LinkedIn', '2026-06-20', 'Replied', '2026-07-05', 'Email', 'Yes', 'No', 'No', 'Interested', 'Very interested. Asked for case studies and pricing breakdown.'],
      ['Glamour Beauty Studio', 'Beauty & Wellness', 4, 9, 5, 7, 'Nadia Hussain', 'nadia@glamourbeauty.pk', '0345-7778899', 'Social Media Management', 'Video Production', 60000, 'Cold Call', '2026-06-22', 'Replied', '2026-07-02', 'Call', 'Yes', 'No', 'No', 'Interested', 'Very active on Instagram. Wants full content calendar.'],
      ['Mountain View Dental', 'Healthcare', 5, 4, 6, 2, 'Dr. Rashid Malik', 'rashid@mountainviewdental.pk', '0300-2223344', 'Website Redesign', 'SEO', 90000, 'Email', '2026-06-24', 'Sent', '2026-06-30', 'Email', 'No', 'No', 'No', 'Contacted', 'Sent intro email. No response yet. Follow up needed.'],
      ['QuickFit Gym', 'Fitness', 3, 6, 4, 5, 'Bilal Chaudhry', 'bilal@quickfitgym.pk', '0322-8889900', 'Video Production', 'Social Media Management', 75000, 'Cold Call', '2026-06-26', 'Voicemail', '2026-07-03', 'Call', 'No', 'No', 'No', 'Prospecting', 'Left voicemail. Website needs major overhaul. Good audit opportunity.'],
      ['Coastal Construction LLC', 'Construction', 6, 3, 5, 1, 'Farhan Sheikh', 'farhan@coastalconstruct.pk', '0311-1112233', 'Website Redesign', 'Branding', 150000, 'LinkedIn', '2026-06-12', 'Replied', '2026-06-20', 'Email', 'Yes', 'Yes', 'Yes', 'Closed Lost', 'Went with competitor. Price sensitivity was the main issue.'],
      ['Miller & Chen Law Office', 'Legal', 7, 4, 8, 3, 'Jennifer Chen', 'jennifer@millerchen.pk', '0301-4445566', 'SEO', 'Website Redesign', 110000, 'Email', '2026-06-19', 'Replied', '2026-07-04', 'Call', 'Yes', 'Yes', 'No', 'Meeting Set', 'Partners meeting scheduled. High-value prospect. Be prepared.'],
      ['Velvet Events Planning', 'Events', 4, 7, 6, 6, 'Zara Siddiqui', 'zara@velvetevents.pk', '0323-6667788', 'Social Media Management', 'Photography', 55000, 'Instagram DM', '2026-06-23', 'Replied', '2026-07-02', 'DM', 'Yes', 'No', 'No', 'Interested', 'Runs large corporate events. Wants full social + photography package.'],
    ];

    for (const row of seeds) ins.run(...row);
    console.log('Database seeded with 10 sample leads.');
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
