import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
export default {
    schema: './src/schema.ts',
    out: './drizzle',
    driver: 'pg',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/jarvis',
    },
};
