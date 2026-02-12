const db = require('../config/db');

exports.getAllEmployees = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM employees ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getEmployeeById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM employees WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createEmployee = async (req, res) => {
    const { name, phone, cpf, cnpj } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO employees (name, phone, cpf, cnpj) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, phone, cpf, cnpj]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { name, phone, cpf, cnpj } = req.body;
    try {
        const result = await db.query(
            'UPDATE employees SET name = $1, phone = $2, cpf = $3, cnpj = $4 WHERE id = $5 RETURNING *',
            [name, phone, cpf, cnpj, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM employees WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.status(200).json({ message: 'Employee deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
