const express = require('express');
const { Pool } = require('pg');
const router = express.Router();

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

// Get all medical history categories
router.get('/medical-history', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM medical_history ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch medical history' });
  }
});

// Get medical history options by category ID
router.get('/medical-history-options/:id', async (req, res) => {
  try {
    const historyId = parseInt(req.params.id);
    const result = await pool.query(
      'SELECT * FROM medical_history_options WHERE medical_history_id = $1 ORDER BY id',
      [historyId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch medical history options' });
  }
});

// Save patient medical history
router.post('/patient-medical-history', async (req, res) => {
  try {
    const { patient_id, medical_history_id, medical_history_option_id, category_title, option_title } = req.body;

    // Check if record already exists
    const existingRecord = await pool.query(
      'SELECT id FROM patient_medical_history WHERE patient_id = $1 AND medical_history_option_id = $2',
      [patient_id, medical_history_option_id]
    );
    
    if (existingRecord.rows.length > 0) {
      return res.json({ message: 'Record already exists' });
    }

    // Insert new record
    const result = await pool.query(
      'INSERT INTO patient_medical_history (patient_id, medical_history_id, medical_history_option_id, category_title, option_title) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [patient_id, medical_history_id, medical_history_option_id, category_title, option_title]
    );

    res.json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save medical history' });
  }
});

// Delete patient medical history
router.delete('/patient-medical-history', async (req, res) => {
  try {
    const { patient_id, medical_history_option_id } = req.body;

    await pool.query(
      'DELETE FROM patient_medical_history WHERE patient_id = $1 AND medical_history_option_id = $2',
      [patient_id, medical_history_option_id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete medical history' });
  }
});

module.exports = router;