const appts = require('../models/appointments.model');

exports.list = (status) => appts.list(status);
exports.get = async (id) => {
  const a = await appts.findById(id);
  if (!a) { const e = new Error('Agendamento não encontrado'); e.status = 404; throw e; }
  return a;
};
exports.create = (data) => {
  if (!data.client_id || !data.service_id || !data.scheduled_at) {
    const e = new Error('Campos obrigatórios ausentes'); e.status = 400; throw e;
  }
  return appts.create(data);
};
exports.update = async (id, data) => {
  const a = await appts.update(id, data);
  if (!a) { const e = new Error('Agendamento não encontrado'); e.status = 404; throw e; }
  return a;
};
exports.updateStatus = (id, status) => appts.updateStatus(id, status);
exports.remove = (id) => appts.remove(id);
exports.today = () => appts.today();
