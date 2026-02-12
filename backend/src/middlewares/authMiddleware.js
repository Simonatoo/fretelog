const { OAuth2Client } = require('google-auth-library');
const db = require('../config/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email } = payload;

        // Check if user exists in our database
        // Check if user exists or create them (UPSERT) to handle race conditions
        let userResult = await db.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING *',
            [payload.name || 'Google User', email]
        );

        // If for some reason the upsert didn't return a row (shouldn't happen with returning *), fetch the user
        if (userResult.rows.length === 0) {
            userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        }

        // Attach user to request object
        req.user = userResult.rows[0];
        next();
    } catch (err) {
        console.error('Auth Error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
