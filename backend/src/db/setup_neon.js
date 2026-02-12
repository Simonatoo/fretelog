const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const setupNeon = async () => {
    try {
        console.log('Starting Neon DB Setup...');

        // 1. Run init.sql
        const initSqlPath = path.join(__dirname, 'init.sql');
        const initSql = fs.readFileSync(initSqlPath, 'utf8');
        console.log('Executing init.sql...');
        await db.query(initSql);
        console.log('init.sql executed successfully.');

        // 2. Create Users Table (if not exists)
        console.log('Creating users table...');
        const createUsersTableQuery = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await db.query(createUsersTableQuery);
        console.log('Users table created.');

        // 3. Seed Vehicle Types
        console.log('Seeding vehicle types...');
        const types = ['Carro', 'Moto', 'Caminhão'];
        for (const type of types) {
            // Use ON CONFLICT to avoid errors if re-running
            await db.query(
                'INSERT INTO vehicles_types (name) VALUES ($1) ON CONFLICT DO NOTHING',
                [type]
            );
        }
        console.log('Vehicle types seeded.');

        console.log('Neon DB Setup Completed Successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error setting up Neon DB:', err);
        process.exit(1);
    }
};

setupNeon();
