const db = require('../config/db');
const appointments = require('../models/appointments.model');
const services = require('../models/services.model');
const payments = require('../models/payments.model');

exports.resumo = async () => {
  const { rows } = await db.query('SELECT * FROM vw_dashboard_resumo');
  return rows[0];
};
exports.agendaHoje = () => appointments.today();
exports.faturamentoMensal = () => payments.monthlyRevenue();
exports.servicosMaisVendidos = () => services.topSelling();
