import winston from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const isDev = process.env.NODE_ENV !== 'production';

// Combined format showing timestamps
const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
  )
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

/**
 * Centrally configured Winston Logger.
 * Swaps format structures automatically depending on active NODE_ENV environments.
 */
export const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  levels,
  format: isDev ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console()
  ],
});

/**
 * Dedicated logger for routing and incoming HTTP requests.
 */
export const requestLogger = {
  info: (message: string, meta?: unknown) => {
    logger.info(`[REQUEST] ${message}`, meta);
  }
};

/**
 * Dedicated logger for exceptions and unhandled system failures.
 */
export const errorLogger = {
  error: (message: string, error?: unknown) => {
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
    logger.error(`[ERROR] ${message} - Details: ${errorDetails}`);
  }
};

/**
 * Dedicated logger to trace slow database calls or heavy operation cycles.
 */
export const performanceLogger = {
  warn: (message: string, durationMs: number) => {
    logger.warn(`[PERFORMANCE] ${message} - Duration: ${durationMs}ms`);
  }
};
