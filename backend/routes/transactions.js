const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const fs = require('fs');

const pool = new Pool({
  user: 'tracker_user',
  host: 'localhost',
  database: 'financial_tracker',
  password: 'password',
  port: 5432,
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST /api/transactions/extract
// Simulated data extraction endpoint
router.post('/extract', auth, upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Save file metadata to DB
    const fileResult = await pool.query(
      'INSERT INTO files (user_id, filename, original_name, mime_type, size) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size]
    );
    const fileId = fileResult.rows[0].id;

    // Simulate fast extraction based on file extension or a random generator
    const extractedData = [
      { type: 'income', amount: 5000.00, description: 'Salary', date: new Date().toISOString().split('T')[0] },
      { type: 'expenditure', amount: 150.50, description: 'Groceries', date: new Date().toISOString().split('T')[0] },
      { type: 'investment', amount: 500.00, description: 'Stocks', date: new Date().toISOString().split('T')[0] }
    ];

    res.json({
      fileId,
      message: 'Extraction successful. Please confirm the data.',
      data: extractedData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during extraction' });
  }
});

// POST /api/transactions
// Save confirmed transactions
router.post('/', auth, async (req, res) => {
  const { transactions, fileId } = req.body;
  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ error: 'Invalid transactions data' });
  }

  try {
    const results = [];
    for (let t of transactions) {
      const result = await pool.query(
        'INSERT INTO transactions (user_id, file_id, type, amount, description, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [req.user, fileId || null, t.type, t.amount, t.description, t.date]
      );
      results.push(result.rows[0]);
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error saving transactions' });
  }
});

// GET /api/transactions
// Fetch all transactions for insights
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC', [req.user]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching transactions' });
  }
});

module.exports = router;
