const db = require('../config/db');

const addStatusColumn = async () => {
    try {
        await db.query(`
            ALTER TABLE vehicles 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active' 
            CHECK (status IN ('Active', 'Driving', 'Maintenance'));
        `);
        console.log("Column 'status' added to 'vehicles' table successfully.");
    } catch (error) {
        console.error("Error adding column:", error);
    } finally {
        // Close the pool? dependent on how db is implemented. 
        // Usually script just runs and exits.
        process.exit();
    }
};

addStatusColumn();
