const { Activity, ContentActivity, Batch, ContentBatch, Product } = require('../models');

// Helpers de base de datos con memoización
const DatabaseHelpers = {
  getClassificationActivity: async () => {
    return Activity.findOne({ where: { name: 'Clasificar' }}) 
      || Promise.reject(new Error('Classification activity not found'));
  },

  getUserBatches: async (userId, activityId) => {
    const activities = await ContentActivity.findAll({
      where: {
        user_encharge_id: userId,
        activity_id: activityId,
        is_active: true
      },
      attributes: ['batch_id'],
      raw: true
    });
    
    return activities.map(activity => activity.batch_id);
  },

  getBatchesWithProducts: async (batchIds) => {
    if (!batchIds.length) return [];
    
    return Batch.findAll({
      where: { batch_id: batchIds },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['name']
      }]
    });
  },

  getBatchDetails: async (batchName) => {
    return Batch.findOne({
      where: { name: batchName },
      include: [{ model: Product, as: 'product' }],
      rejectOnEmpty: true
    });
  }
};

// Cache simple para cálculos frecuentes
const stemCache = new Map();

const BatchOperations = {
  calculateTotalStems: async (batchId) => {
    if (stemCache.has(batchId)) {
      return stemCache.get(batchId);
    }

    const contents = await ContentBatch.findAll({
      where: { batch_id: batchId },
      attributes: ['quantity_of_stems'],
      raw: true
    });

    const total = contents.reduce((sum, { quantity_of_stems }) => sum + quantity_of_stems, 0);
    stemCache.set(batchId, total);
    
    return total;
  },

  generateBatchMetadata: async (batches) => {
    const BATCH_CONCURRENCY_LIMIT = 5; // Evitar sobrecarga de DB
    const results = [];
    
    for (let i = 0; i < batches.length; i += BATCH_CONCURRENCY_LIMIT) {
      const batchChunk = batches.slice(i, i + BATCH_CONCURRENCY_LIMIT);
      const chunkResults = await Promise.all(
        batchChunk.map(async batch => ({
          label: `🌱 *${batch.name}* ${batch.product.name} ${await BatchOperations.calculateTotalStems(batch.batch_id)}`,
          nameLote: batch.name,
          idLote: `${batch.batch_id}-LOTES-CLASIFICACION`,
          metadata: {
            product: batch.product.name,
            totalStems: stemCache.get(batch.batch_id)
          }
        }))
      );
      results.push(...chunkResults);
    }
    
    return results;
  }
};

// Servicio principal con transacciones y validaciones
const BatchService = {
  getAvailableBatches: async (user) => {
    try {
      const activity = await DatabaseHelpers.getClassificationActivity();
      const batchIds = await DatabaseHelpers.getUserBatches(user.user_id, activity.activity_id);
      const batches = await DatabaseHelpers.getBatchesWithProducts(batchIds);
      
      return batches.length 
        ? BatchOperations.generateBatchMetadata(batches)
        : [];
        
    } catch (error) {
      console.error(`BatchService Error: ${error.message}`);
      throw new Error('Failed to retrieve available batches');
    }
  },

  getBatchDetails: DatabaseHelpers.getBatchDetails
};

// Interface de servicio mejorada
module.exports = {
  BatchService,
  BatchOperations: {
    calculateTotalStems: BatchOperations.calculateTotalStems
  }
};