const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'sparkflow-dev-secret-change-me';

let pool = null;
let dbReady = false;

function getPool() {
  if (!pool) {
    const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    if (!url) throw new Error('No database URL. Set POSTGRES_URL in Vercel → Settings → Environment Variables.');
    pool = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 1 });
  }
  return pool;
}

function serialize(row) {
  if (!row) return row;
  const r = { ...row };
  if (r.created_at instanceof Date) r.created_at = r.created_at.toISOString();
  if (r.updated_at instanceof Date) r.updated_at = r.updated_at.toISOString();
  return r;
}

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

async function initDb() {
  if (dbReady) return;
  const p = getPool();

  await p.query(`
    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      business_name TEXT, industry TEXT,
      contact_name TEXT, email TEXT, phone TEXT,
      primary_service TEXT, secondary_service TEXT, package_value REAL,
      outreach_channel TEXT, date_contacted TEXT, outreach_status TEXT,
      followup_date TEXT, followup_method TEXT,
      response_received TEXT, meeting_scheduled TEXT, proposal_sent TEXT,
      deal_status TEXT DEFAULT 'Prospecting', notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'caller',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const { rows: uRows } = await p.query('SELECT COUNT(*) as count FROM users');
  if (parseInt(uRows[0].count) === 0) {
    const adminHash = await bcrypt.hash('admin1234', 10);
    const callerHash = await bcrypt.hash('caller1234', 10);
    await p.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)', ['Admin', 'admin@sparkflow.pk', adminHash, 'admin']);
    await p.query('INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)', ['Caller', 'caller@sparkflow.pk', callerHash, 'caller']);
    console.log('Seeded admin and caller users.');
  }

  dbReady = true;
}

app.use(async (req, res, next) => {
  try { await initDb(); next(); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Auth ───────────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const { rows } = await getPool().query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));

// ── Leads ──────────────────────────────────────────────────────────────
const ALLOWED = [
  'business_name','industry',
  'contact_name','email','phone','primary_service','secondary_service','package_value',
  'outreach_channel','date_contacted','outreach_status','followup_date','followup_method',
  'response_received','meeting_scheduled','proposal_sent','deal_status','notes',
];
const CALLER_ALLOWED = [
  'deal_status','outreach_status','followup_date','followup_method',
  'response_received','meeting_scheduled','proposal_sent','notes',
];

app.get('/api/leads', authenticate, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM leads ORDER BY created_at DESC');
    res.json(rows.map(serialize));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/leads/:id', authenticate, async (req, res) => {
  try {
    const { rows } = await getPool().query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Lead not found' });
    res.json(serialize(rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/leads', authenticate, adminOnly, async (req, res) => {
  try {
    if (!req.body.business_name) return res.status(400).json({ error: 'business_name is required' });
    const fields = ALLOWED.filter(f => req.body[f] !== undefined);
    const cols = fields.join(', ');
    const ph = fields.map((_, i) => `$${i + 1}`).join(', ');
    const vals = fields.map(f => req.body[f]);
    const { rows } = await getPool().query(`INSERT INTO leads (${cols}) VALUES (${ph}) RETURNING *`, vals);
    res.status(201).json(serialize(rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/leads/:id', authenticate, async (req, res) => {
  try {
    const allowed = req.user.role === 'admin' ? ALLOWED : CALLER_ALLOWED;
    const fields = Object.keys(req.body).filter(f => allowed.includes(f));
    if (!fields.length) return res.status(400).json({ error: 'No valid fields for your role' });
    const set = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await getPool().query(
      `UPDATE leads SET ${set}, updated_at = NOW() WHERE id = $${vals.length} RETURNING *`, vals
    );
    res.json(serialize(rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/leads/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { rowCount } = await getPool().query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Dashboard ──────────────────────────────────────────────────────────
app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    const p = getPool();
    const cnt = async (sql, vals = []) => parseInt((await p.query(sql, vals)).rows[0].c);
    const total      = await cnt("SELECT COUNT(*) as c FROM leads");
    const contacted  = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status != 'Prospecting'");
    const interested = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Interested','Meeting Set','Proposal Sent','Closed Won')");
    const meetings   = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Meeting Set','Proposal Sent','Closed Won')");
    const proposals  = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Proposal Sent','Closed Won')");
    const closedWon  = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status = 'Closed Won'");
    const closedLost = await cnt("SELECT COUNT(*) as c FROM leads WHERE deal_status = 'Closed Lost'");
    const pipeline = await Promise.all(
      ['Prospecting','Contacted','Interested','Meeting Set','Proposal Sent','Closed Won','Closed Lost']
        .map(async stage => ({ stage, count: await cnt('SELECT COUNT(*) as c FROM leads WHERE deal_status = $1', [stage]) }))
    );
    const { rows: recentActivity } = await p.query('SELECT * FROM leads ORDER BY updated_at DESC LIMIT 10');
    res.json({
      kpis: { total, contacted, interested, meetings, proposals, closedWon },
      pipeline,
      recentActivity: recentActivity.map(serialize),
      stats: {
        conversionRate: total > 0 ? ((closedWon / total) * 100).toFixed(1) : '0.0',
        responseRate: contacted > 0 ? ((interested / contacted) * 100).toFixed(1) : '0.0',
      },
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Follow-ups ─────────────────────────────────────────────────────────
app.get('/api/followups', authenticate, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { rows } = await getPool().query(`
      SELECT * FROM leads
      WHERE followup_date IS NOT NULL AND followup_date != ''
        AND followup_date <= $1
        AND deal_status NOT IN ('Closed Won','Closed Lost')
      ORDER BY followup_date ASC
    `, [today]);
    res.json(rows.map(serialize));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = app;
