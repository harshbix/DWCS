import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import { logger, requestLogger } from './config/logger.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Basic Security & Performance Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(compression());
app.use(express.json());

// Bind Morgan network streams directly to Winston
app.use(
  morgan(':method :url :status - :response-time ms', {
    stream: {
      write: (message) => requestLogger.info(message.trim()),
    },
  })
);

// Mount API Endpoints
app.use('/api/v1', apiRouter);

// Catch undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'API_ROUTE_NOT_FOUND',
      message: `The endpoint ${req.method} ${req.url} was not found on this server.`,
    },
    meta: {},
  });
});

// Mount Central Error Filter
app.use(errorHandler);

const PORT = env.PORT;

// Bootstrap Server
app.listen(PORT, () => {
  logger.info(`🚀 EcoCollect Core API started in ${env.NODE_ENV} mode on port ${PORT}`);
});
