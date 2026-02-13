const db = require('../config/db');

// Get aggregated dashboard data
const getDashboardData = async (req, res) => {
    try {
        const { startDate, endDate, driverId } = req.query;

        // Base filter conditions
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (startDate) {
            whereConditions.push(`operation_date >= $${paramIndex}`);
            queryParams.push(startDate);
            paramIndex++;
        }
        if (endDate) {
            whereConditions.push(`operation_date <= $${paramIndex}`);
            queryParams.push(endDate);
            paramIndex++;
        }
        if (driverId) {
            whereConditions.push(`driver_id = $${paramIndex}`);
            queryParams.push(driverId);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

        // 1. Total Operations Count
        const totalOpsResult = await db.query(`SELECT COUNT(*) FROM operations ${whereClause}`, queryParams);
        const totalOperations = parseInt(totalOpsResult.rows[0].count);

        // 2. Financials (Revenue, Cost, Profit)
        const financialsResult = await db.query(`
            SELECT 
                SUM(operation_value) as total_revenue,
                SUM(driver_value + COALESCE(support_value, 0) + COALESCE(toll, 0)) as total_cost
            FROM operations ${whereClause}
        `, queryParams);

        const totalRevenue = parseFloat(financialsResult.rows[0].total_revenue || 0);
        const totalCost = parseFloat(financialsResult.rows[0].total_cost || 0);
        const netProfit = totalRevenue - totalCost;

        // 3. Operations by Company (for Chart)
        // Need to alias operations table as 'o' for the join, so we adjust the where clause variable for this query
        // Or simpler: just use full table name references in whereClause if possible, but 'operation_date' and 'driver_id' are ambiguous?
        // No, 'operation_date' and 'driver_id' are only in operations table. 'id' might be ambiguous.
        // Let's rely on the fact that column names are unique enough or prefix them.
        // Actually, safer to rebuild whereClause with prefix 'o.' for joins.

        let joinWhereConditions = [];
        // Re-map params for the join query
        if (startDate) joinWhereConditions.push(`o.operation_date >= $${1}`); // we reuse params array, so indices must match
        if (endDate) joinWhereConditions.push(`o.operation_date <= $${startDate ? 2 : 1}`);
        if (driverId) joinWhereConditions.push(`o.driver_id = $${(startDate ? 1 : 0) + (endDate ? 1 : 0) + 1}`);

        // Construct where clause with prefixes
        let prefixedWhereConditions = [];
        let tempIdx = 1;
        if (startDate) { prefixedWhereConditions.push(`o.operation_date >= $${tempIdx}`); tempIdx++; }
        if (endDate) { prefixedWhereConditions.push(`o.operation_date <= $${tempIdx}`); tempIdx++; }
        if (driverId) { prefixedWhereConditions.push(`o.driver_id = $${tempIdx}`); tempIdx++; }

        const joinWhereClause = prefixedWhereConditions.length > 0 ? 'WHERE ' + prefixedWhereConditions.join(' AND ') : '';

        const opsByCompanyResult = await db.query(`
            SELECT c.name, COUNT(o.id) as count
            FROM operations o
            JOIN companies c ON o.company_id = c.id
            ${joinWhereClause}
            GROUP BY c.name
            ORDER BY count DESC
            LIMIT 5
        `, queryParams);

        // 4. Recent Operations (for Table)
        const recentOpsResult = await db.query(`
            SELECT o.id, c.name as company_name, o.operation_date, o.operation_value
            FROM operations o
            JOIN companies c ON o.company_id = c.id
            ${joinWhereClause}
            ORDER BY o.operation_date DESC -- Changed to operation_date for better relevance with filters
            LIMIT 5
        `, queryParams);

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
