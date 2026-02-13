const db = require('../config/db');

const addTollColumn = async () => {
    try {
        await db.query(`
            ALTER TABLE operations 
            ADD COLUMN IF NOT EXISTS toll DECIMAL(10, 2) DEFAULT 0;
        `);
        console.log('Toll column added successfully.');
    } catch (err) {
        console.error('Error adding toll column:', err);
    } finally {
        // Close pool if needed, or just let process exit
        process.exit();
    }
};

addTollColumn();
