const express = require('express');
const companyRouters = require('./routers/companyRouters');
const userRouters = require('./routers/userRouters');
const productRouters = require('./routers/productRouters');
const measureRouters = require('./routers/measureRouter');
const clasificationRouters = require('./routers/clasificationRouters');
const batchRouters = require('./routers/batchRouters');
const providerRouters = require('./routers/providerRouters');
const noveltyRouters = require('./routers/noveltyRouters');
const webhookRouters = require('./routers/webhookRouters');
const flowRouters = require('./routers/flowRouters');
const modelRouters = require('./routers/modelRouters');
const stepRouters = require('./routers/stepRouters');
const flowHistorieRouters = require('./routers/flowHistorieRouters');
const flowHistoryDataRouters = require('./routers/flowHistoryDataRouters');
const messagePersistenceRouter = require('./routers/messagePersistenceRouter');
const contentBatchRoutes = require('./routers/contentBatchRoutes');
const activityRouters = require('./routers/activityRouters');
const contentActivities = require('./routers/contentActivityRoutes');
const permittedProcessesRoutes = require('./routers/permittedProcessesRoutes');
const rolesRoutes = require('./routers/rolesRoutes');
const app  = express();
const errorHandler = require('./middlewares/errorHandler'); 
const availableTest = require('./llm/availableBatch')

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to DataGreen!');
});

app.use('/v1/companies', companyRouters);
app.use('/v1/users', userRouters);
app.use('/v1/products', productRouters);
app.use('/v1/measures', measureRouters);
app.use('/v1/clasifications', clasificationRouters);
app.use('/v1/providers', providerRouters);
app.use('/v1/batchs', batchRouters);
app.use('/v1/novelties', noveltyRouters);
app.use('/v1/webhooks', webhookRouters);
app.use('/v1/flows', flowRouters);
app.use('/v1/models', modelRouters);
app.use('/v1/steps', stepRouters);
app.use('/v1/flowHistories', flowHistorieRouters);
app.use('/v1/flowHistoryData', flowHistoryDataRouters);
app.use('/v1/messagePersistences', messagePersistenceRouter);
app.use('/v1/contentBatches', contentBatchRoutes);
app.use('/v1/activities', activityRouters);
app.use('/v1/contentActivities', contentActivities);
app.use('/v1/permittedProcesses', permittedProcessesRoutes);
app.use('/v1/roles', rolesRoutes);


app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server up, and listen to 3000');
});

(async ()=>{
    await availableTest.getAvailableBatch();
})();

