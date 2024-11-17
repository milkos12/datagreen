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
const app  = express();
const errorHandler = require('./middleware/errorHandler'); 

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

app.use(errorHandler);

app.listen(3000, () => {
    console.log('Server up, and listen to 3000');
});