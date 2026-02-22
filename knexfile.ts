import type { Knex } from 'knex';
import { config } from './src/config';

const knexConfig: { [key: string]: Knex.Config } = {
    development: {
        client: 'pg',
        connection: config.db.url || {
            host: config.db.host,
            port: config.db.port,
            user: config.db.user,
            password: config.db.password,
            database: config.db.database,
        },
        migrations: {
            directory: './src/infrastructure/database/migrations',
            extension: 'ts',
        },
        seeds: {
            directory: './src/infrastructure/database/seeds',
            extension: 'ts',
        },
    },
    production: {
        client: 'pg',
        connection: config.db.url,
        pool: {
            min: 2,
            max: 20,
        },
        migrations: {
            directory: './src/infrastructure/database/migrations',
        },
    },
};

export default knexConfig;
