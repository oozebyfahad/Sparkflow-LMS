const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const q = (sql) => db.prepare(sql).get().c;

    const total = q('SELECT COUNT(*) as c FROM leads');
    const contacted = q("SELECT COUNT(*) as c FROM leads WHERE deal_status != 'Prospecting'");
    const interested = q("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Interested','Meeting Set','Proposal Sent','Closed Won')");
    const meetings = q("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Meeting Set','Proposal Sent','Closed Won')");
    const proposals = q("SELECT COUNT(*) as c FROM leads WHERE deal_status IN ('Proposal Sent','Closed Won')");
    const closedWon = q("SELECT COUNT(*) as c FROM leads WHERE deal_status = 'Closed Won'");
    const closedLost = q("SELECT COUNT(*) as c FROM leads WHERE deal_status = 'Closed Lost'");

    const stageCount = (s) => q(`SELECT COUNT(*) as c FROM leads WHERE deal_status = '${s}'`);

    const pipeline = [
      { stage: 'Prospecting', count: stageCount('Prospecting') },
      { stage: 'Contacted', count: stageCount('Contacted') },
      { stage: 'Interested', count: stageCount('Interested') },
      { stage: 'Meeting Set', count: stageCount('Meeting Set') },
      { stage: 'Proposal Sent', count: stageCount('Proposal Sent') },
      { stage: 'Closed Won', count: closedWon },
      { stage: 'Closed Lost', count: closedLost },
    ];

    const recentActivity = db.prepare('SELECT * FROM leads ORDER BY updated_at DESC LIMIT 10').all();

    const conversionRate = total > 0 ? ((closedWon / total) * 100).toFixed(1) : '0.0';
    const responseRate = contacted > 0 ? ((interested / contacted) * 100).toFixed(1) : '0.0';

    res.json({
      kpis: { total, contacted, interested, meetings, proposals, closedWon },
      pipeline,
      recentActivity,
      stats: { conversionRate, responseRate },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
