const db = require('../config/db');

const createUsersTable = async () => {
    try {
        await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Users table created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating users table', err);
        process.exit(1);
    }
};

createUsersTable();
