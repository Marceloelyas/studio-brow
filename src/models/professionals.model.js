const db = require('../config/db');

exports.list = async () => {
  const { rows } = await db.query(
    `SELECT p.id, u.name, p.specialty
     FROM professionals p
     JOIN users u ON u.id = p.user_id
     WHERE p.active = true
     ORDER BY u.name`
  );
  return rows;
};
