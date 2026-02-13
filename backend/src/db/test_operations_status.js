const db = require('../config/db');

const testStatus = async () => {
    try {
        console.log('Testing status column functionality...');

        // 1. Create a dummy company, vehicle type, vehicle, driver, support for foreign keys...
        // This is complex. Maybe just insert into operations if we have existing data?
        // Or assume data exists?
        // Let's check for existing data first.

        // Actually, simple unit test if we mock DB is better, but this is integration.
        // Let's try to query existing foreign keys.

        const companies = await db.query('SELECT id FROM companies LIMIT 1');
        const vehicles = await db.query('SELECT id FROM vehicles LIMIT 1');
        const employees = await db.query('SELECT id FROM employees LIMIT 2');

        let companyId, vehicleId, driverId, supportId;

        if (companies.rows.length > 0) companyId = companies.rows[0].id;
        if (vehicles.rows.length > 0) vehicleId = vehicles.rows[0].id;
        if (employees.rows.length > 0) {
            driverId = employees.rows[0].id;
            supportId = employees.rows[1] ? employees.rows[1].id : employees.rows[0].id;
        }

        if (!companyId || !vehicleId || !driverId) {
            console.log('Not enough data to run full insert test. Checking schema only.');
            // Check column existence
            const res = await db.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'operations' AND column_name = 'status';
            `);
            if (res.rows.length > 0) {
                console.log('Status column exists:', res.rows[0]);
            } else {
                console.error('Status column does NOT exist.');
                process.exit(1);
            }
            process.exit(0);
        }

        // 2. Insert with status
        console.log('Inserting operation with status "Completed"...');
        const insertRes = await db.query(
            'INSERT INTO operations (company_id, vehicle_id, driver_id, support_id, operation_value, operation_date, driver_value, support_value, estimated_time, status) VALUES ($1, $2, $3, $4, 100, NOW(), 50, 50, \'1h\', \'Completed\') RETURNING *',
            [companyId, vehicleId, driverId, supportId]
        );
        console.log('Inserted:', insertRes.rows[0]);

        if (insertRes.rows[0].status !== 'Completed') {
            throw new Error('Status mismatch on insert');
        }

        // 3. Update status
        const id = insertRes.rows[0].id;
        console.log(`Updating operation ${id} to "Canceled"...`);
        const updateRes = await db.query(
            'UPDATE operations SET status = $1 WHERE id = $2 RETURNING *',
            ['Canceled', id]
        );
        console.log('Updated:', updateRes.rows[0]);

        if (updateRes.rows[0].status !== 'Canceled') {
            throw new Error('Status mismatch on update');
        }

        // 4. Clean up
        await db.query('DELETE FROM operations WHERE id = $1', [id]);
        console.log('Cleaned up.');

        console.log('Verification passed!');
        process.exit(0);

    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
};

testStatus();
