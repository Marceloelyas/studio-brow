const db = require('../config/db');

exports.list = async (q) => {
  const { rows } = await db.query(
    `SELECT id, name, phone, email, birth_date, notes, created_at
     FROM clients
     WHERE ($1::text IS NULL
        OR name ILIKE '%' || $1 || '%'
        OR phone ILIKE '%' || $1 || '%')
     ORDER BY name`,
    [q || null]
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query(
    'SELECT * FROM clients WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

exports.create = async ({ name, email, phone, birth_date, notes }) => {
  const { rows } = await db.query(
    `INSERT INTO clients (name, email, phone, birth_date, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, email || null, phone, birth_date || null, notes || null]
  );
  return rows[0];
};

exports.update = async (id, { name, email, phone, birth_date, notes }) => {
  const { rows } = await db.query(
    `UPDATE clients
     SET name=$1, email=$2, phone=$3, birth_date=$4, notes=$5
     WHERE id=$6 RETURNING *`,
    [name, email || null, phone, birth_date || null, notes || null, id]
  );
  return rows[0] || null;
};

exports.remove = async (id) => {
  await db.query('DELETE FROM clients WHERE id=$1', [id]);
};

exports.history = async (id) => {
  const { rows } = await db.query(
    `SELECT a.scheduled_at, a.status, s.name AS service_name, s.price
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE a.client_id = $1
     ORDER BY a.scheduled_at DESC`,
    [id]
  );
  return rows;
};
