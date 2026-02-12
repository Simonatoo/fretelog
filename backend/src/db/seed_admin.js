const db = require('../config/db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
    try {
        console.log('Starting Admin User Seeding...');

        // 1. Add password column if it doesn't exist
        console.log('Checking/Adding password column...');
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN 
                    ALTER TABLE users ADD COLUMN password VARCHAR(255); 
                END IF; 
            END $$;
        `);
        console.log('Password column check complete.');

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin', salt);

        // 3. Create or Update Admin user
        // We use UPSERT on email to ensure Admin exists with correct password
        const email = 'admin@frelog.com';
        const name = 'Admin';

        console.log(`Seeding user: ${email}`);

        // Ensure email is unique constrain is respected (it is by definition of the table)
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            // Update password
            await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
            console.log('Admin user updated.');
        } else {
            // Create user
            await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3)', [name, email, hashedPassword]);
            console.log('Admin user created.');
        }

        console.log('Seeding Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding Admin user:', err);
        process.exit(1);
    }
};

seedAdmin();
