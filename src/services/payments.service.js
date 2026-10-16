const pay = require('../models/payments.model');

exports.listRecent = (limit) => pay.listRecent(limit);
exports.create = (data) => {
  if (!data.appointment_id || !data.amount || !data.method) {
    const e = new Error('Campos obrigatórios ausentes'); e.status = 400; throw e;
  }
  return pay.create(data);
};
exports.update = async (id, data) => {
  const p = await pay.update(id, data);
  if (!p) { const e = new Error('Pagamento não encontrado'); e.status = 404; throw e; }
  return p;
};
exports.remove = (id) => pay.remove(id);
exports.monthlyRevenue = () => pay.monthlyRevenue();
