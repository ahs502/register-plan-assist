import * as express from 'express';

const app = express();

import apiRouter from './Api';
app.use('/api', apiRouter);

export default app;
