const contact = require('../models/contact.model');

exports.list = () => contact.list();
exports.create = (data) => {
  if (!data.name || !data.email || !data.message) {
    const e = new Error('Nome, e-mail e mensagem são obrigatórios'); e.status = 400; throw e;
  }
  return contact.create(data);
};
exports.markRead = (id) => contact.markRead(id);
exports.markAllRead = () => contact.markAllRead();
