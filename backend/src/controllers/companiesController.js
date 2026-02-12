const db = require('../config/db');

exports.getAllCompanies = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM companies ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM companies WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCompany = async (req, res) => {
    const { name, cnpj } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO companies (name, cnpj) VALUES ($1, $2) RETURNING *',
            [name, cnpj]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateCompany = async (req, res) => {
    const { id } = req.params;
    const { name, cnpj } = req.body;
    try {
        const result = await db.query(
            'UPDATE companies SET name = $1, cnpj = $2 WHERE id = $3 RETURNING *',
            [name, cnpj, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCompany = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM companies WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
