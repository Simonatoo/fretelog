const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const db = require('./config/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
const authController = require('../controllers/authController');
router.post('/auth/login', authController.login);

app.use('/api', routes);

app.get('/', (req, res) => {
    res.send('Frelog Backend is running');
});

// Database Connection Check
db.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Database connected successfully');

        // Start server only after DB check (optional, but good for logs)
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
});
