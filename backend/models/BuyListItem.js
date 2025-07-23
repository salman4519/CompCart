const mongoose = require('mongoose');

const BuyListItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  project: { type: String, required: true},
  isCompleted: { type: Boolean, default: false },
  addedDate: { type: String, required: true },
});

module.exports = mongoose.model('BuyListItem', BuyListItemSchema); 