import pool from '../config/db.js';

/* 1️⃣ Statistiques du tableau de bord (ventes jour/mois/année, stock) */
export const getDashboardStats = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();

  // – Ventes du jour, du mois, de l’année
  const [[{ daySales, dayTransactions }]] = await pool.query(`
    SELECT IFNULL(SUM(total),0) AS daySales,
           COUNT(*) AS dayTransactions
    FROM sales
    WHERE sale_date = ?`, [`${year}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`]);

  const [[{ monthSales, monthTransactions }]] = await pool.query(`
    SELECT IFNULL(SUM(total),0) AS monthSales,
           COUNT(*) AS monthTransactions
    FROM sales
    WHERE YEAR(sale_date)=? AND MONTH(sale_date)=?`, [year, month]);

  const [[{ yearSales, yearTransactions }]] = await pool.query(`
    SELECT IFNULL(SUM(total),0) AS yearSales,
           COUNT(*) AS yearTransactions
    FROM sales
    WHERE YEAR(sale_date)=?`, [year]);

  // – Stock global & alertes
  const [[{ totalStock, lowStock, criticalStock }]] = await pool.query(`
    SELECT SUM(stock) AS totalStock,
           SUM(CASE WHEN stock < min_stock THEN 1 ELSE 0 END) AS lowStock,
           SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) AS criticalStock
    FROM products`);

  // – Employés actifs / en congé
  const [[{ activeEmployees, vacationEmployees }]] = await pool.query(`
    SELECT SUM(status='active') AS activeEmployees,
           SUM(status='vacation') AS vacationEmployees
    FROM employees`);

  return {
    day:  { sales: daySales,   transactions: dayTransactions },
    month:{ sales: monthSales, transactions: monthTransactions },
    year: { sales: yearSales,  transactions: yearTransactions },
    stock:{ total: totalStock, low: lowStock, critical: criticalStock },
    employees:{ active: activeEmployees, vacation: vacationEmployees }
  };
};

/* 2️⃣ Statistiques de performance (par employé, par rayon) */
export const employeePerformance = async () => {
  const [rows] = await pool.query(`
    SELECT e.id, e.name AS employeeName,
           COUNT(s.id) AS transactions,
           IFNULL(SUM(s.total),0) AS revenue,
           IFNULL(SUM(si.quantity),0) AS itemsSold,
           e.department
    FROM employees e
    LEFT JOIN sales s ON s.cashier_id = e.id
    LEFT JOIN sale_items si ON si.sale_id = s.id
    GROUP BY e.id
    ORDER BY revenue DESC`);
  return rows;
};

export const departmentPerformance = async () => {
  const [rows] = await pool.query(`
    SELECT s.department,
           COUNT(s.id) AS transactions,
           IFNULL(SUM(s.total),0) AS revenue,
           IFNULL(SUM(si.quantity),0) AS itemsSold
    FROM sales s
    LEFT JOIN sale_items si ON si.sale_id = s.id
    GROUP BY s.department
    ORDER BY revenue DESC`);
  return rows;
};
