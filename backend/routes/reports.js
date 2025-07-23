const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

function getMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

router.get('/summary', async (req, res) => {
  try {
    const purchases = await Purchase.find();
    const totalSpent = purchases.reduce((sum, p) => sum + p.items.reduce((itemSum, item) => itemSum + (item.price || 0), 0), 0);
    const totalPurchases = purchases.length;
    const monthlyMap = {};
    purchases.forEach(p => {
      const month = getMonth(new Date(p.date));
      if (!monthlyMap[month]) monthlyMap[month] = { items: 0, spent: 0 };
      monthlyMap[month].items += p.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      monthlyMap[month].spent += p.items.reduce((itemSum, item) => itemSum + (item.price || 0), 0);
    });
    const monthlyTrends = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));
    const categoryMap = {};
    purchases.forEach(p => {
      p.items.forEach(item => {
        const cat = item.project || "Uncategorized";
        if (!categoryMap[cat]) categoryMap[cat] = 0;
        categoryMap[cat] += item.quantity;
      });
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    // Yearly Trends
    const yearlyMap = {};
    purchases.forEach(p => {
      const year = new Date(p.date).getFullYear().toString();
      if (!yearlyMap[year]) yearlyMap[year] = { items: 0, spent: 0 };
      yearlyMap[year].items += p.items.reduce((itemSum, item) => itemSum + item.quantity, 0);
      yearlyMap[year].spent += p.items.reduce((itemSum, item) => itemSum + (item.price || 0), 0);
    });
    const yearlyTrends = Object.entries(yearlyMap).map(([year, data]) => ({
      year,
      ...data,
    }));

    res.json({
      totalSpent,
      totalPurchases,
      monthlyTrends,
      categoryBreakdown,
      yearlyTrends, // Include yearly trends in response
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch report data' });
  }
});

module.exports = router; 