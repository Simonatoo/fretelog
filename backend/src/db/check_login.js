const db = require('../config/db');
const bcrypt = require('bcryptjs');

const checkLogin = async (email, password) => {
    try {
        console.log(`Checking login for: ${email}`);
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userResult.rows.length === 0) {
            console.log('User not found.');
            process.exit(1);
        }

        const user = userResult.rows[0];
        console.log('User found:', user.email);
        console.log('Stored Hash:', user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`Password match for '${password}':`, isMatch);

        if (isMatch) {
            console.log('LOGIN SUCCESSFUL ✅');
        } else {
            console.log('LOGIN FAILED ❌');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkLogin('admin@frelog.com', 'Admin');
