const db = require('../config/db');

exports.getAllOperations = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM operations ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOperationById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM operations WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Operation not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOperation = async (req, res) => {
    const { companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO operations (company_id, vehicle_id, driver_id, support_id, operation_value, operation_date, driver_value, support_value, estimated_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOperation = async (req, res) => {
    const { id } = req.params;
    const { companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time } = req.body;
    try {
        const result = await db.query(
            'UPDATE operations SET company_id = $1, vehicle_id = $2, driver_id = $3, support_id = $4, operation_value = $5, operation_date = $6, driver_value = $7, support_value = $8, estimated_time = $9 WHERE id = $10 RETURNING *',
            [companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Operation not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteOperation = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM operations WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Operation not found' });
        }
        res.status(200).json({ message: 'Operation deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
