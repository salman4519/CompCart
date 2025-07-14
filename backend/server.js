require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const purchaseRoutes = require('./routes/purchase');
const buyListRoutes = require('./routes/buylist');
const reportsRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

app.use('/api/purchases', purchaseRoutes);
app.use('/api/buylist', buyListRoutes);
app.use('/api/reports', reportsRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => console.error('MongoDB connection error:', err)); 