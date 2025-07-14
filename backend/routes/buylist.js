const express = require('express');
const router = express.Router();
const BuyListItem = require('../models/BuyListItem');

// Get all buy list items
router.get('/', async (req, res) => {
  try {
    const items = await BuyListItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new buy list item
router.post('/', async (req, res) => {
  try {
    const { name, quantity, isCompleted, addedDate } = req.body;
    const item = new BuyListItem({ name, quantity, isCompleted, addedDate });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single buy list item
router.get('/:id', async (req, res) => {
  try {
    const item = await BuyListItem.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a buy list item
router.put('/:id', async (req, res) => {
  try {
    const { name, quantity, isCompleted, addedDate } = req.body;
    const item = await BuyListItem.findByIdAndUpdate(
      req.params.id,
      { name, quantity, isCompleted, addedDate },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a buy list item
router.delete('/:id', async (req, res) => {
  try {
    const item = await BuyListItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 