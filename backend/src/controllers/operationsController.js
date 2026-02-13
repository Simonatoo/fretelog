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
    const { companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time, status } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO operations (company_id, vehicle_id, driver_id, support_id, operation_value, operation_date, driver_value, support_value, estimated_time, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [companyId, VehicleId, driverId, supportId, operation_value, operation_date, driver_value, support_value, estimated_time, status || 'Pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOperation = async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    console.log(`Update Operation ${id} Body:`, body);

    // Map common frontend keys to DB columns if needed, or just accept snake_case
    // We will accept snake_case keys directly which match the DB columns.
    // Also support the existing camelCase keys for backward compatibility if needed.

    const fields = [];
    const values = [];
    let idx = 1;

    const mappings = {
        companyId: 'company_id',
        VehicleId: 'vehicle_id',
        vehicleId: 'vehicle_id',
        driverId: 'driver_id',
        supportId: 'support_id',
        // other fields are already snake_case
    };

    // Allowed columns to prevent SQL injection via random body keys
    const allowedColumns = [
        'company_id', 'vehicle_id', 'driver_id', 'support_id',
        'operation_value', 'operation_date', 'driver_value', 'support_value',
        'estimated_time', 'status'
    ];

    Object.keys(body).forEach(key => {
        let dbColumn = mappings[key] || key;

        if (allowedColumns.includes(dbColumn)) {
            fields.push(`${dbColumn} = $${idx}`);
            values.push(body[key]);
            idx++;
        }
    });

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(id);
    const query = `UPDATE operations SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

    try {
        const result = await db.query(query, values);
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
