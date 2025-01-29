const { Activity, ContentActivity, Batch, ContentBatch, Product } = require('../models');
const batch = require('../models/batch');

async function determinateAmoutStemsBatch(batchId) {
    let contentBatch = await ContentBatch.findAll({
        where: {
            batch_id: batchId
        }
    });
    
    let conut = 0;

    contentBatch.forEach((contne) => {
        conut += contne.quantity_of_stems;
    });
    
    return conut;
}

async function textSummaryBatch(batchs) {

    const array = await Promise.all(
        batchs.map(async (batch) => {
          const amount = await determinateAmoutStemsBatch(batch.batch_id);
          return {leable:`- 🌱 *${batch.name}* ${batch.product.name} ${amount}\n`, nameLote: batch.name, idLote: batch.batch_id};
        })
      );
    
    return array;
}

async function getAvailableBatch(user) {
    
    let activityData = await Activity.findAll({
        where: {
            name: 'Clasificar'
        }
    });

    user = {user_id: 'e2995234-c720-43bb-a6ef-fdcc2fb43e77'}

    let activitiesUser = await ContentActivity.findAll({
        where: {
            user_encharge_id: user.user_id,
            activity_id: activityData[0].activity_id,
            is_active: true
        }
    });

    let batchIds = activitiesUser.map((activity) => {
        return activity.content_batch_id;
    });

    batchIds = await ContentBatch.findAll({
        where: {
            content_batch_id: batchIds
        }
    });

    batchIds = batchIds.map((batchConten) => {
        console.log('-.-.-. ', batchConten);
        return batchConten.batch_id;
    });
    
    let batchsData = await Batch.findAll({
        where: {
            batch_id: batchIds
        },
        include: [
            {
                model: Product,
                as: 'product',
                attributes: ['name']
            }
        ]
    });

    const dataBatchAvailable = await textSummaryBatch(batchsData);
    console.log("-----AS", dataBatchAvailable)
    return dataBatchAvailable
}

module.exports = {
    getAvailableBatch,
}