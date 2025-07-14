const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');
const multer = require('multer');
const path = require('path');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Get all purchases
router.get('/', async (req, res) => {
  try {
    const purchases = await Purchase.find();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new purchase
router.post('/', async (req, res) => {
  try {
    const { date, items, billFile } = req.body;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const purchase = new Purchase({ date, items, billFile, totalItems });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload bill file endpoint
router.post('/upload-bill', upload.single('bill'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename });
});

// Get a single purchase
router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Not found' });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a purchase
router.put('/:id', async (req, res) => {
  try {
    const { date, items, billFile } = req.body;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { date, items, billFile, totalItems },
      { new: true }
    );
    if (!purchase) return res.status(404).json({ error: 'Not found' });
    res.json(purchase);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a purchase
router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 