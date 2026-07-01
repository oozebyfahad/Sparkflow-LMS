const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const { adminOnly } = require('../middleware/auth');

const ALLOWED_FIELDS = [
  'business_name', 'industry', 'website_score', 'social_score', 'branding_score',
  'video_score', 'contact_name', 'email', 'phone', 'primary_service', 'secondary_service',
  'package_value', 'outreach_channel', 'date_contacted', 'outreach_status', 'followup_date',
  'followup_method', 'response_received', 'meeting_scheduled', 'proposal_sent', 'deal_status', 'notes'
];

const CALLER_ALLOWED = [
  'deal_status', 'outreach_status', 'followup_date', 'followup_method',
  'response_received', 'meeting_scheduled', 'proposal_sent', 'notes',
];

router.get('/', (req, res) => {
  try {
    const leads = getDb().prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const lead = getDb().prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', adminOnly, (req, res) => {
  try {
    const db = getDb();
    if (!req.body.business_name) return res.status(400).json({ error: 'business_name is required' });
    const fields = ALLOWED_FIELDS.filter(f => req.body[f] !== undefined);
    const cols = fields.join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(f => req.body[f]);
    const result = db.prepare(`INSERT INTO leads (${cols}) VALUES (${placeholders})`).run(...values);
    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newLead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const db = getDb();
    const allowed = req.user.role === 'admin' ? ALLOWED_FIELDS : CALLER_ALLOWED;
    const fields = Object.keys(req.body).filter(f => allowed.includes(f));
    if (!fields.length) return res.status(400).json({ error: 'No valid fields for your role' });
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => req.body[f]);
    db.prepare(`UPDATE leads SET ${setClause}, updated_at = datetime('now') WHERE id = ?`)
      .run(...values, req.params.id);
    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', adminOnly, (req, res) => {
  try {
    const result = getDb().prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
