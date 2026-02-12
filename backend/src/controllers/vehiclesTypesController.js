const db = require('../config/db');

exports.getAllVehicleTypes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vehicles_types ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVehicleTypeById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM vehicles_types WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle Type not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createVehicleType = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO vehicles_types (name) VALUES ($1) RETURNING *',
            [name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateVehicleType = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await db.query(
            'UPDATE vehicles_types SET name = $1 WHERE id = $2 RETURNING *',
            [name, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle Type not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVehicleType = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM vehicles_types WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle Type not found' });
        }
        res.status(200).json({ message: 'Vehicle Type deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
