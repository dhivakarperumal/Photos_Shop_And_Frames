const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Users router is running',
    data: [],
  });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Users service healthy',
  });
});

router.post('/login', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Authentication endpoint not implemented yet',
  });
});

module.exports = router;
