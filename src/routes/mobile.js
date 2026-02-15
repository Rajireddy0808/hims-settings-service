const express = require('express');
const router = express.Router();

// In-memory storage for call requests
let callRequests = [];
let requestIdCounter = 1;

// Trigger mobile call
router.post('/trigger-mobile-call', (req, res) => {
  const { patientId, userId } = req.body;
  
  const callRequest = {
    id: requestIdCounter++,
    patientId,
    userId,
    timestamp: new Date(),
  };
  
  callRequests.push(callRequest);
  
  res.json({ success: true, message: 'Mobile call triggered' });
});

// Get pending call requests
router.get('/mobile-call-requests', (req, res) => {
  const userId = req.user?.id;
  const userRequests = callRequests.filter(request => request.userId === userId);
  res.json(userRequests);
});

// Delete processed request
router.delete('/mobile-call-requests/:id', (req, res) => {
  const requestId = parseInt(req.params.id);
  callRequests = callRequests.filter(request => request.id !== requestId);
  res.json({ success: true });
});

module.exports = router;