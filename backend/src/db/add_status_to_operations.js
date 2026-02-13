const db = require('../config/db');

const addStatusColumn = async () => {
    try {
        console.log('Starting migration: Adding status column to operations table...');

        // 1. Add the column if it doesn't exist
        await db.query(`
            ALTER TABLE operations 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
        `);
        console.log('Column "status" added (or already exists).');

        // 2. Add the check constraint
        // We use a DO block to safely add the constraint only if it doesn't exist
        await db.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'operations_status_check') THEN
                    ALTER TABLE operations 
                    ADD CONSTRAINT operations_status_check 
                    CHECK (status IN ('Pending', 'Completed', 'Canceled'));
                END IF;
            END $$;
        `);
        console.log('Constraint "operations_status_check" added (or already exists).');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    }
};

addStatusColumn();
