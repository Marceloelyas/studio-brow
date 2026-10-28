const db = require('../config/db');

// Login da cliente
exports.login = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' });

    // Limpa o telefone para buscar no banco
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Busca a cliente (ignorando formatação)
    const { rows } = await db.query(
      `SELECT id, name, phone, email FROM clients 
       WHERE REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', '') LIKE '%' || $1 || '%'`,
      [cleanPhone]
    );

    if (!rows.length) return res.status(404).json({ error: 'Cliente não encontrada.' });

    const client = rows[0];
    
    // Cria a sessão da cliente (guardamos o ID e o tipo 'client')
    req.session.client = { id: client.id, name: client.name, role: 'client' };
    
    res.json({ name: client.name });
  } catch (err) { next(err); }
};

// Buscar dados da própria cliente
exports.me = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, phone, email, birth_date, notes FROM clients WHERE id = $1',
      [req.session.client.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// Atualizar dados da própria cliente
exports.updateMe = async (req, res, next) => {
  try {
    const { phone, email, birth_date } = req.body;
    
    // Validação básica
    if (!phone) return res.status(400).json({ error: 'Telefone é obrigatório.' });

    const { rows } = await db.query(
      `UPDATE clients SET phone=$1, email=$2, birth_date=$3 
       WHERE id=$4 RETURNING id, name, phone, email, birth_date`,
      [phone, email || null, birth_date || null, req.session.client.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// Ver agendamentos da própria cliente
exports.myAppointments = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT a.scheduled_at, a.status, s.name AS service_name, s.price
       FROM appointments a
       JOIN services s ON s.id = a.service_id
       WHERE a.client_id = $1
       ORDER BY a.scheduled_at DESC`,
      [req.session.client.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
};
