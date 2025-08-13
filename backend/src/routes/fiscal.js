const express = require('express');
const router = express.Router();
const { getOne, getMany, create, update, remove } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get fiscal calendar data
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    const calendarData = await getMany('SELECT * FROM fiscal_calendar ORDER BY date_echeance ASC');
    res.json({
      success: true,
      data: calendarData
    });
  } catch (error) {
    console.error('Error fetching fiscal calendar:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du calendrier fiscal'
    });
  }
});

// Get unique categories
router.get('/calendar/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await getMany(
      'SELECT DISTINCT categorie_personnes FROM fiscal_calendar ORDER BY categorie_personnes'
    );
    res.json({
      success: true,
      data: categories.map(cat => cat.categorie_personnes)
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des catégories'
    });
  }
});

// Get sub-categories for a given category
router.get('/calendar/subcategories/:category', authenticateToken, async (req, res) => {
  try {
    const { category } = req.params;
    const subCategories = await getMany(
      'SELECT DISTINCT sous_categorie FROM fiscal_calendar WHERE categorie_personnes = $1 AND sous_categorie IS NOT NULL ORDER BY sous_categorie',
      [category]
    );
    res.json({
      success: true,
      data: subCategories.map(sub => sub.sous_categorie)
    });
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des sous-catégories'
    });
  }
});

// Get TVA obligations
router.get('/calendar/tva', authenticateToken, async (req, res) => {
  try {
    const tvaObligations = await getMany(
      'SELECT * FROM fiscal_calendar WHERE is_tva_assujetti = true ORDER BY date_echeance ASC'
    );
    res.json({
      success: true,
      data: tvaObligations
    });
  } catch (error) {
    console.error('Error fetching TVA obligations:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des obligations TVA'
    });
  }
});

module.exports = router;
