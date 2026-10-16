const clients = require('../models/clients.model');

exports.list = (q) => clients.list(q);
exports.get = async (id) => {
  const c = await clients.findById(id);
  if (!c) { const e = new Error('Cliente não encontrada'); e.status = 404; throw e; }
  return c;
};
exports.create = (data) => {
  if (!data.name || !data.phone) {
    const e = new Error('Nome e telefone são obrigatórios'); e.status = 400; throw e;
  }
  return clients.create(data);
};
exports.update = async (id, data) => {
  const c = await clients.update(id, data);
  if (!c) { const e = new Error('Cliente não encontrada'); e.status = 404; throw e; }
  return c;
};
exports.remove = (id) => clients.remove(id);
exports.history = (id) => clients.history(id);
