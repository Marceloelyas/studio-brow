const db = require('../config/db');

exports.findByCredentials = async (email, password) => {
  const { rows } = await db.query(
    `SELECT id, name, role FROM users
     WHERE email = $1 AND password_hash = crypt($2, password_hash)`,
    [email, password]
  );
  return rows[0] || null;
};

exports.findById = async (id) => {
  const { rows } = await db.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};
