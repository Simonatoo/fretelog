const db = require('../config/db');

// Get aggregated dashboard data
const getDashboardData = async (req, res) => {
    try {
        // 1. Total Operations Count
        const totalOpsResult = await db.query('SELECT COUNT(*) FROM operations');
        const totalOperations = parseInt(totalOpsResult.rows[0].count);

        // 2. Financials (Revenue, Cost, Profit)
        // Revenue = user's input 'operation_value'
        // Cost = driver_value + support_value
        const financialsResult = await db.query(`
      SELECT 
        SUM(operation_value) as total_revenue,
        SUM(driver_value + COALESCE(support_value, 0)) as total_cost
      FROM operations
    `);

        const totalRevenue = parseFloat(financialsResult.rows[0].total_revenue || 0);
        const totalCost = parseFloat(financialsResult.rows[0].total_cost || 0);
        const netProfit = totalRevenue - totalCost;

        // 3. Operations by Company (for Chart)
        const opsByCompanyResult = await db.query(`
      SELECT c.name, COUNT(o.id) as count
      FROM operations o
      JOIN companies c ON o.company_id = c.id
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 5
    `);

        // 4. Recent Operations (for Table)
        const recentOpsResult = await db.query(`
      SELECT o.id, c.name as company_name, o.operation_date, o.operation_value
      FROM operations o
      JOIN companies c ON o.company_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

        res.json({
            stats: {
                totalOperations,
                totalRevenue,
                totalCost,
                netProfit
            },
            charts: {
                opsByCompany: opsByCompanyResult.rows
            },
            recentOperations: recentOpsResult.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getDashboardData
};
