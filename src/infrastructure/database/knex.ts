import knex from 'knex';
import knexConfig from '../../../knexfile';
import { config } from '@config/index';
import { logger } from '@services/logger';

const environment = config.env === 'production' ? 'production' : 'development';
const db = knex(knexConfig[environment]);

// Test Connection
db.raw('SELECT 1')
    .then(() => {
        logger.info('🐘 Database connected successfully');
    })
    .catch((err) => {
        logger.error('❌ Database connection failed:', err);
    });

export default db;
