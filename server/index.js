const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { init, getDb } = require('./db');
const { authenticate, adminOnly, JWT_SECRET } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

init().then(() => {
  // ── Auth ──────────────────────────────────────────────────────────────
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const db = getDb();
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const payload = { id: user.id, email: user.email, name: user.name, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: payload });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/me', authenticate, (req, res) => res.json(req.user));

  // ── Protected routes ──────────────────────────────────────────────────
  app.use('/api/leads', authenticate, require('./routes/leads'));
  app.use('/api/dashboard', authenticate, require('./routes/dashboard'));

  app.get('/api/followups', authenticate, (req, res) => {
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
