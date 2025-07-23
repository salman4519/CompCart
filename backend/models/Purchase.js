const mongoose = require('mongoose');

const PurchaseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  project: { type: String }, // Add project field to purchase items
});

const PurchaseSchema = new mongoose.Schema({
  date: { type: String, required: true },
  items: [PurchaseItemSchema],
  billFile: { type: String },
  totalItems: { type: Number, required: true },
});

module.exports = mongoose.model('Purchase', PurchaseSchema); 