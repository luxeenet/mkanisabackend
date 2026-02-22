import 'module-alias/register';
import app from './api/app';
import { config } from '@config/index';
import { logger } from '@services/logger';

const PORT = config.port;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
    logger.error(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
