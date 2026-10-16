const db = require('../config/db');

exports.list = async (status) => {
  const { rows } = await db.query(
    `SELECT a.id, a.scheduled_at, a.status,
            c.name  AS client_name,
            c.phone AS client_phone,
            s.name  AS service_name,
            s.price
     FROM appointments a
     JOIN clients  c ON c.id = a.client_id
     JOIN services s ON s.id = a.service_id
     WHERE ($1::text IS NULL OR a.status::text = $1)
     ORDER BY a.scheduled_at DESC
     LIMIT 200`,
    [status || null]
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query(
    'SELECT * FROM appointments WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.create = async ({ client_id, professional_id, service_id, scheduled_at, notes }) => {
  const { rows } = await db.query(
    `INSERT INTO appointments (client_id, professional_id, service_id, scheduled_at, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [client_id, professional_id || null, service_id, scheduled_at, notes || null]
  );
  return rows[0];
};

exports.update = async (id, { client_id, professional_id, service_id, scheduled_at, notes, status }) => {
  const { rows } = await db.query(
    `UPDATE appointments
     SET client_id=$1, professional_id=$2, service_id=$3,
         scheduled_at=$4, notes=$5, status=$6
     WHERE id=$7 RETURNING *`,
    [client_id, professional_id || null, service_id, scheduled_at, notes || null, status, id]
  );
  return rows[0] || null;
};

exports.updateStatus = async (id, status) => {
  const { rows } = await db.query(
    'UPDATE appointments SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  await db.query('DELETE FROM appointments WHERE id=$1', [id]);
};

exports.today = async () => {
  const { rows } = await db.query('SELECT * FROM vw_agenda_hoje');
  return rows;
};
