const db = require('../config/db');

exports.list = async (all = false) => {
  const { rows } = await db.query(
    `SELECT * FROM services ${all ? '' : 'WHERE active = true'} ORDER BY name`
  );
  return rows;
};

exports.findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM services WHERE id=$1', [id]);
  return rows[0] || null;
};

exports.create = async ({ name, description, price, duration_minutes }) => {
  const { rows } = await db.query(
    `INSERT INTO services (name, description, price, duration_minutes)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, description || null, price, duration_minutes]
  );
  return rows[0];
};

exports.update = async (id, { name, description, price, duration_minutes, active }) => {
  const { rows } = await db.query(
    `UPDATE services
     SET name=$1, description=$2, price=$3, duration_minutes=$4, active=$5
     WHERE id=$6 RETURNING *`,
    [name, description || null, price, duration_minutes, active ?? true, id]
  );
  return rows[0] || null;
};

exports.deactivate = async (id) => {
  await db.query('UPDATE services SET active=false WHERE id=$1', [id]);
};

exports.topSelling = async () => {
  const { rows } = await db.query('SELECT * FROM vw_servicos_mais_vendidos');
  return rows;
};
