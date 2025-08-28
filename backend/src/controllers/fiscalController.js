const { query, getOne, getMany } = require('../config/database');
const fiscalObligationService = require('../services/fiscalObligationService');
const automatedObligationService = require('../services/automatedObligationService');

// Get all fiscal calendar entries with optional filtering
const getFiscalCalendarEntries = async (req, res) => {
  try {
    const {
      categorie_personnes,
      sous_categorie,
      type,
      tag,
      frequence_declaration,
      mois,
      formulaire
    } = req.query;

    let sql = 'SELECT * FROM fiscal_calendar WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Add filters
    if (categorie_personnes) {
      sql += ` AND categorie_personnes = $${paramIndex++}`;
      params.push(categorie_personnes);
    }

    if (sous_categorie) {
      sql += ` AND sous_categorie = $${paramIndex++}`;
      params.push(sous_categorie);
    }

    if (type) {
      sql += ` AND type = $${paramIndex++}`;
      params.push(type);
    }

    if (tag) {
      sql += ` AND tag = $${paramIndex++}`;
      params.push(tag);
    }

    if (frequence_declaration) {
      sql += ` AND frequence_declaration = $${paramIndex++}`;
      params.push(frequence_declaration);
    }

    if (mois) {
      sql += ` AND mois = $${paramIndex++}`;
      params.push(mois);
    }

    if (formulaire) {
      sql += ` AND formulaire = $${paramIndex++}`;
      params.push(formulaire);
    }

    sql += ' ORDER BY id ASC';

    const entries = await getMany(sql, params);

    res.json({
      success: true,
      data: entries,
      count: entries.length
    });

  } catch (error) {
    console.error('Get fiscal calendar entries error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fiscal calendar entries',
      message: 'Erreur lors de la récupération des entrées du calendrier fiscal'
    });
  }
};

// Get a single fiscal calendar entry by ID
const getFiscalCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await getOne('SELECT * FROM fiscal_calendar WHERE id = $1', [id]);

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
        message: 'Entrée du calendrier fiscal non trouvée'
      });
    }

    res.json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Get fiscal calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fiscal calendar entry',
      message: 'Erreur lors de la récupération de l\'entrée du calendrier fiscal'
    });
  }
};

// Create a new fiscal calendar entry
const createFiscalCalendarEntry = async (req, res) => {
  try {
    const {
      categorie_personnes,
      sous_categorie,
      type,
      tag,
      frequence_declaration,
      periode_declaration,
      mois,
      jours,
      detail_declaration,
      formulaire,
      lien,
      commentaire
    } = req.body;

    // Validate required fields
    if (!categorie_personnes || !type || !tag || !frequence_declaration) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Champs obligatoires manquants'
      });
    }

    const result = await query(
      `INSERT INTO fiscal_calendar (
        categorie_personnes, sous_categorie, type, tag, frequence_declaration,
        periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        categorie_personnes, sous_categorie, type, tag, frequence_declaration,
        periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire
      ]
    );

    // Trigger obligation regeneration due to calendar update
    try {
      await automatedObligationService.triggerCalendarUpdateRegeneration(req.user.email);
      console.log('✅ Obligation regeneration triggered due to new calendar entry');
    } catch (regenerationError) {
      console.error('Warning: Failed to regenerate obligations after calendar update:', regenerationError);
      // Don't fail the calendar creation if regeneration fails
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Entrée du calendrier fiscal créée avec succès'
    });

  } catch (error) {
    console.error('Create fiscal calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create fiscal calendar entry',
      message: 'Erreur lors de la création de l\'entrée du calendrier fiscal'
    });
  }
};

// Update a fiscal calendar entry
const updateFiscalCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      categorie_personnes,
      sous_categorie,
      type,
      tag,
      frequence_declaration,
      periode_declaration,
      mois,
      jours,
      detail_declaration,
      formulaire,
      lien,
      commentaire
    } = req.body;

    // Check if entry exists
    const existingEntry = await getOne('SELECT id FROM fiscal_calendar WHERE id = $1', [id]);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
        message: 'Entrée du calendrier fiscal non trouvée'
      });
    }

    const result = await query(
      `UPDATE fiscal_calendar SET
        categorie_personnes = COALESCE($1, categorie_personnes),
        sous_categorie = $2,
        type = COALESCE($3, type),
        tag = COALESCE($4, tag),
        frequence_declaration = COALESCE($5, frequence_declaration),
        periode_declaration = $6,
        mois = $7,
        jours = $8,
        detail_declaration = $9,
        formulaire = $10,
        lien = $11,
        commentaire = $12,
        updated_at = NOW()
      WHERE id = $13
      RETURNING *`,
      [
        categorie_personnes, sous_categorie, type, tag, frequence_declaration,
        periode_declaration, mois, jours, detail_declaration, formulaire, lien, commentaire, id
      ]
    );

    // Trigger obligation regeneration due to calendar update
    try {
      await automatedObligationService.triggerCalendarUpdateRegeneration(req.user.email);
      console.log('✅ Obligation regeneration triggered due to calendar entry update');
    } catch (regenerationError) {
      console.error('Warning: Failed to regenerate obligations after calendar update:', regenerationError);
      // Don't fail the calendar update if regeneration fails
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Entrée du calendrier fiscal mise à jour avec succès'
    });

  } catch (error) {
    console.error('Update fiscal calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update fiscal calendar entry',
      message: 'Erreur lors de la mise à jour de l\'entrée du calendrier fiscal'
    });
  }
};

// Delete a fiscal calendar entry
const deleteFiscalCalendarEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry exists
    const existingEntry = await getOne('SELECT id FROM fiscal_calendar WHERE id = $1', [id]);
    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        error: 'Entry not found',
        message: 'Entrée du calendrier fiscal non trouvée'
      });
    }

    await query('DELETE FROM fiscal_calendar WHERE id = $1', [id]);

    // Trigger obligation regeneration due to calendar update
    try {
      await automatedObligationService.triggerCalendarUpdateRegeneration(req.user.email);
      console.log('✅ Obligation regeneration triggered due to calendar entry deletion');
    } catch (regenerationError) {
      console.error('Warning: Failed to regenerate obligations after calendar deletion:', regenerationError);
      // Don't fail the calendar deletion if regeneration fails
    }

    res.json({
      success: true,
      message: 'Entrée du calendrier fiscal supprimée avec succès'
    });

  } catch (error) {
    console.error('Delete fiscal calendar entry error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete fiscal calendar entry',
      message: 'Erreur lors de la suppression de l\'entrée du calendrier fiscal'
    });
  }
};

// Get fiscal calendar statistics
const getFiscalCalendarStats = async (req, res) => {
  try {
    // Get total count
    const totalResult = await getOne('SELECT COUNT(*) as total FROM fiscal_calendar');
    const total = parseInt(totalResult.total);

    // Get counts by type
    const typeStats = await getMany('SELECT type, COUNT(*) as count FROM fiscal_calendar GROUP BY type');
    const byType = {};
    typeStats.forEach(stat => {
      byType[stat.type] = parseInt(stat.count);
    });

    // Get counts by frequency
    const frequencyStats = await getMany('SELECT frequence_declaration, COUNT(*) as count FROM fiscal_calendar GROUP BY frequence_declaration');
    const byFrequency = {};
    frequencyStats.forEach(stat => {
      byFrequency[stat.frequence_declaration] = parseInt(stat.count);
    });

    // Get counts by category
    const categoryStats = await getMany('SELECT categorie_personnes, COUNT(*) as count FROM fiscal_calendar GROUP BY categorie_personnes');
    const byCategory = {};
    categoryStats.forEach(stat => {
      byCategory[stat.categorie_personnes] = parseInt(stat.count);
    });

    // Get counts by tag
    const tagStats = await getMany('SELECT tag, COUNT(*) as count FROM fiscal_calendar GROUP BY tag');
    const byTag = {};
    tagStats.forEach(stat => {
      byTag[stat.tag] = parseInt(stat.count);
    });

    res.json({
      success: true,
      data: {
        totalEntries: total,
        byType,
        byFrequency,
        byCategory,
        byTag
      }
    });

  } catch (error) {
    console.error('Get fiscal calendar stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get fiscal calendar statistics',
      message: 'Erreur lors de la récupération des statistiques du calendrier fiscal'
    });
  }
};

// Get unique values for filters
const getFiscalCalendarFilterOptions = async (req, res) => {
  try {
    const categories = await getMany('SELECT DISTINCT categorie_personnes FROM fiscal_calendar ORDER BY categorie_personnes');
    const subCategories = await getMany('SELECT DISTINCT sous_categorie FROM fiscal_calendar WHERE sous_categorie IS NOT NULL ORDER BY sous_categorie');
    const types = await getMany('SELECT DISTINCT type FROM fiscal_calendar ORDER BY type');
    const tags = await getMany('SELECT DISTINCT tag FROM fiscal_calendar ORDER BY tag');
    const frequencies = await getMany('SELECT DISTINCT frequence_declaration FROM fiscal_calendar ORDER BY frequence_declaration');
    const formulas = await getMany('SELECT DISTINCT formulaire FROM fiscal_calendar WHERE formulaire IS NOT NULL ORDER BY formulaire');

    res.json({
      success: true,
      data: {
        categories: categories.map(c => c.categorie_personnes),
        subCategories: subCategories.map(c => c.sous_categorie),
        types: types.map(t => t.type),
        tags: tags.map(t => t.tag),
        frequencies: frequencies.map(f => f.frequence_declaration),
        formulas: formulas.map(f => f.formulaire)
      }
    });

  } catch (error) {
    console.error('Get fiscal calendar filter options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get filter options',
      message: 'Erreur lors de la récupération des options de filtre'
    });
  }
};

// Generate obligations for a company
const generateObligationsForCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;

    const obligations = await fiscalObligationService.generateObligationsForCompany(companyId, userId);
    const savedObligations = await fiscalObligationService.saveObligations(obligations);

    res.json({
      success: true,
      message: `Generated ${savedObligations.length} obligations for company`,
      data: savedObligations
    });
  } catch (error) {
    console.error('Error generating obligations for company:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations',
      message: 'Erreur lors de la génération des obligations'
    });
  }
};

// Generate obligations for all user companies
const generateObligationsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const obligations = await fiscalObligationService.generateObligationsForUser(userId);
    const savedObligations = await fiscalObligationService.saveObligations(obligations);

    res.json({
      success: true,
      message: `Generated ${savedObligations.length} obligations for all companies`,
      data: savedObligations
    });
  } catch (error) {
    console.error('Error generating obligations for user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations',
      message: 'Erreur lors de la génération des obligations'
    });
  }
};

// Generate obligations for all companies for 2025 (admin only)
const generateObligationsForAllCompanies = async (req, res) => {
  try {
    const { managerEmail, year = 2025 } = req.body;
    
    if (!managerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Manager email is required',
        message: 'Email du manager requis'
      });
    }

    console.log(`Starting obligation generation for all companies for year ${year} by manager: ${managerEmail}`);

    const summary = await fiscalObligationService.generateObligationsForAllCompanies(managerEmail, year);

    res.json({
      success: true,
      message: `Successfully generated obligations for ${summary.companiesWithObligations} companies`,
      data: summary
    });
  } catch (error) {
    console.error('Error generating obligations for all companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations for all companies',
      message: 'Erreur lors de la génération des obligations pour toutes les entreprises'
    });
  }
};

// Generate obligations for all companies with dynamic date range (admin only)
const generateObligationsForAllCompaniesDynamic = async (req, res) => {
  try {
    const { managerEmail } = req.body;
    
    if (!managerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Manager email is required',
        message: 'Email du manager requis'
      });
    }

    console.log(`Starting dynamic obligation generation for all companies by manager: ${managerEmail}`);

    const summary = await fiscalObligationService.generateObligationsForAllCompaniesDynamic(managerEmail);

    res.json({
      success: true,
      message: `Successfully generated obligations for ${summary.companiesWithObligations} companies`,
      data: summary
    });
  } catch (error) {
    console.error('Error generating obligations for all companies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations for all companies',
      message: 'Erreur lors de la génération des obligations pour toutes les entreprises'
    });
  }
};

// Manual trigger for automated service (admin only)
const triggerManualGeneration = async (req, res) => {
  try {
    const { managerEmail } = req.body;
    
    if (!managerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Manager email is required',
        message: 'Email du manager requis'
      });
    }

    console.log(`Manual obligation generation triggered by: ${managerEmail}`);

    const summary = await automatedObligationService.triggerManualGeneration(managerEmail);

    res.json({
      success: true,
      message: `Successfully generated obligations for ${summary.companiesWithObligations} companies`,
      data: summary
    });
  } catch (error) {
    console.error('Error during manual generation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate obligations',
      message: 'Erreur lors de la génération des obligations'
    });
  }
};

module.exports = {
  getFiscalCalendarEntries,
  getFiscalCalendarEntry,
  createFiscalCalendarEntry,
  updateFiscalCalendarEntry,
  deleteFiscalCalendarEntry,
  getFiscalCalendarStats,
  getFiscalCalendarFilterOptions,
  generateObligationsForCompany,
  generateObligationsForUser,
  generateObligationsForAllCompanies,
  generateObligationsForAllCompaniesDynamic,
  triggerManualGeneration
};
