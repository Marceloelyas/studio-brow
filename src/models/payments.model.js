const db = require('../config/db');

exports.listRecent = async (limit = 20) => {
  const { rows } = await db.query(
    `SELECT p.id, p.amount, p.method, p.status, p.paid_at,
            c.name AS client_name
     FROM payments p
     JOIN appointments a ON a.id = p.appointment_id
     JOIN clients c ON c.id = a.client_id
     ORDER BY p.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

exports.create = async ({ appointment_id, amount, method, status }) => {
  const { rows } = await db.query(
    `INSERT INTO payments (appointment_id, amount, method, status, paid_at)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [appointment_id, amount, method,
     status || 'pago',
     status === 'pago' ? new Date() : null]
  );
  return rows[0];
};

exports.update = async (id, { amount, method, status }) => {
  const { rows } = await db.query(
    `UPDATE payments SET amount=$1, method=$2, status=$3,
       paid_at = CASE WHEN $3='pago' THEN COALESCE(paid_at, now()) ELSE paid_at END
     WHERE id=$4 RETURNING *`,
    [amount, method, status, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  await db.query('DELETE FROM payments WHERE id=$1', [id]);
};

exports.monthlyRevenue = async () => {
  const { rows } = await db.query(
    `SELECT date_trunc('month', paid_at) AS mes, SUM(amount) AS total
     FROM payments WHERE status='pago'
     GROUP BY 1 ORDER BY 1 DESC LIMIT 12`
  );
  return rows;
};
