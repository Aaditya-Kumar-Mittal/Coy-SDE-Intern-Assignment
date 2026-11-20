import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

const app = express();

const origins = process.env.CLIENT_ORIGIN?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
app.use(cors({ origin: origins?.length ? origins : true }));
app.use(express.json());

app.use(requestLogger);

app.use('/', routes);
app.use('/api', routes);

app.use(errorHandler);

export default app;