const express = require('express');
const cors = require('cors');
const medicalHistoryRoutes = require('./src/routes/medicalHistory');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', medicalHistoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'settings-service', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Settings Service running on port ${PORT}`);
});