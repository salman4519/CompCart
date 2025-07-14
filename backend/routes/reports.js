const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

function getMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/summary', async (req, res) => {
  try {
    const purchases = await Purchase.find();
    const totalSpent = purchases.reduce((sum, p) => sum + (p.price || 0), 0);
    const totalPurchases = purchases.length;
    const monthlyMap = {};
    purchases.forEach(p => {
      const month = getMonth(new Date(p.date));
      if (!monthlyMap[month]) monthlyMap[month] = { items: 0, spent: 0 };
      monthlyMap[month].items += 1;
      monthlyMap[month].spent += p.price || 0;
    });
    const monthlyTrends = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));
    const categoryMap = {};
    purchases.forEach(p => {
      const cat = p.category || "Uncategorized";
      if (!categoryMap[cat]) categoryMap[cat] = 0;
      categoryMap[cat] += 1;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));
    res.json({
      totalSpent,
      totalPurchases,
      monthlyTrends,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report data' });
  }
});

module.exports = router; 