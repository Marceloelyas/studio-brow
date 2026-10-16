const svc = require('../models/services.model');

exports.list = (all) => svc.list(all);
exports.get = async (id) => {
  const s = await svc.findById(id);
  if (!s) { const e = new Error('Serviço não encontrado'); e.status = 404; throw e; }
  return s;
};
exports.create = (data) => {
  if (!data.name || !data.price || !data.duration_minutes) {
    const e = new Error('Campos obrigatórios ausentes'); e.status = 400; throw e;
  }
  return svc.create(data);
};
exports.update = async (id, data) => {
  const s = await svc.update(id, data);
  if (!s) { const e = new Error('Serviço não encontrado'); e.status = 404; throw e; }
  return s;
};
exports.deactivate = (id) => svc.deactivate(id);
exports.topSelling = () => svc.topSelling();
