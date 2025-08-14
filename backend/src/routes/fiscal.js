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

// ===== ADMIN ROUTES FOR FISCAL CALENDAR MANAGEMENT =====

// Create new fiscal calendar item (Admin only)
router.post('/admin/calendar', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent créer des éléments du calendrier fiscal.'
      });
    }

    const {
      liste,
      categorie_personnes,
      sous_categorie,
      mois,
      type_impot,
      date_echeance,
      periode_declaration,
      type_declaration,
      formulaire,
      lien,
      commentaire,
      is_tva_assujetti
    } = req.body;

    const result = await create('fiscal_calendar', {
      liste,
      categorie_personnes,
      sous_categorie,
      mois,
      type_impot,
      date_echeance,
      periode_declaration,
      type_declaration,
      formulaire,
      lien,
      commentaire,
      is_tva_assujetti: is_tva_assujetti || false
    });

    res.json({
      success: true,
      data: result,
      message: 'Élément du calendrier fiscal créé avec succès'
    });
  } catch (error) {
    console.error('Error creating fiscal calendar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'élément du calendrier fiscal'
    });
  }
});

// Update fiscal calendar item (Admin only)
router.put('/admin/calendar/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent modifier des éléments du calendrier fiscal.'
      });
    }

    const { id } = req.params;
    const {
      liste,
      categorie_personnes,
      sous_categorie,
      mois,
      type_impot,
      date_echeance,
      periode_declaration,
      type_declaration,
      formulaire,
      lien,
      commentaire,
      is_tva_assujetti
    } = req.body;

    const result = await update('fiscal_calendar', id, {
      liste,
      categorie_personnes,
      sous_categorie,
      mois,
      type_impot,
      date_echeance,
      periode_declaration,
      type_declaration,
      formulaire,
      lien,
      commentaire,
      is_tva_assujetti: is_tva_assujetti || false
    });

    res.json({
      success: true,
      data: result,
      message: 'Élément du calendrier fiscal mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating fiscal calendar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'élément du calendrier fiscal'
    });
  }
});

// Delete fiscal calendar item (Admin only)
router.delete('/admin/calendar/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent supprimer des éléments du calendrier fiscal.'
      });
    }

    const { id } = req.params;
    await remove('fiscal_calendar', id);

    res.json({
      success: true,
      message: 'Élément du calendrier fiscal supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting fiscal calendar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'élément du calendrier fiscal'
    });
  }
});

// Bulk import fiscal calendar items (Admin only)
router.post('/admin/calendar/import', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Accès refusé. Seuls les administrateurs peuvent importer des éléments du calendrier fiscal.'
      });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun élément à importer'
      });
    }

    const importedItems = [];
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const item = items[i];
        const result = await create('fiscal_calendar', {
          liste: item.liste,
          categorie_personnes: item.categorie_personnes,
          sous_categorie: item.sous_categorie,
          mois: item.mois,
          type_impot: item.type_impot,
          date_echeance: item.date_echeance,
          periode_declaration: item.periode_declaration,
          type_declaration: item.type_declaration,
          formulaire: item.formulaire,
          lien: item.lien,
          commentaire: item.commentaire,
          is_tva_assujetti: item.is_tva_assujetti || false
        });
        importedItems.push(result);
      } catch (error) {
        errors.push({
          index: i,
          item: items[i],
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        imported: importedItems.length,
        errors: errors.length,
        errorDetails: errors
      },
      message: `${importedItems.length} éléments importés avec succès${errors.length > 0 ? `, ${errors.length} erreurs` : ''}`
    });
  } catch (error) {
    console.error('Error importing fiscal calendar items:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'importation des éléments du calendrier fiscal'
    });
  }
});

module.exports = router;
