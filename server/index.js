const express = require('express');
const cors = require('cors');
const { init, getDb } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

init().then(() => {
  app.use('/api/leads', require('./routes/leads'));
  app.use('/api/dashboard', require('./routes/dashboard'));

  app.get('/api/followups', (req, res) => {
    try {
      const db = getDb();
      const today = new Date().toISOString().split('T')[0];
      const leads = db.prepare(`
        SELECT * FROM leads
        WHERE followup_date IS NOT NULL
        AND followup_date != ''
        AND followup_date <= ?
        AND deal_status NOT IN ('Closed Won', 'Closed Lost')
        ORDER BY followup_date ASC
      `).all(today);
      res.json(leads);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Sparkflow server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
