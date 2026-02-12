const db = require('../config/db');

exports.getAllVehicles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vehicles ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getVehicleById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM vehicles WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createVehicle = async (req, res) => {
    const { plate, km, vehicle_type_id } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO vehicles (plate, km, vehicle_type_id) VALUES ($1, $2, $3) RETURNING *',
            [plate, km, vehicle_type_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateVehicle = async (req, res) => {
    const { id } = req.params;
    const { plate, km, vehicle_type_id } = req.body;
    try {
        const result = await db.query(
            'UPDATE vehicles SET plate = $1, km = $2, vehicle_type_id = $3 WHERE id = $4 RETURNING *',
            [plate, km, vehicle_type_id, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.status(200).json({ message: 'Vehicle deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
