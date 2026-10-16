const db = require('../config/db');

exports.list = async () => {
  const { rows } = await db.query(
    'SELECT * FROM contact_messages ORDER BY read ASC, created_at DESC'
  );
  return rows;
};

exports.create = async ({ name, email, phone, subject, message }) => {
  const { rows } = await db.query(
    `INSERT INTO contact_messages (name, email, phone, subject, message)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [name, email, phone || null, subject || null, message]
  );
  return rows[0];
};

exports.markRead = async (id) => {
  const { rows } = await db.query(
    'UPDATE contact_messages SET read=true WHERE id=$1 RETURNING *',
    [id]
  );
  return rows[0] || null;
};

exports.markAllRead = async () => {
  await db.query('UPDATE contact_messages SET read=true WHERE read=false');
};
