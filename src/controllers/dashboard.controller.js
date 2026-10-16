const service = require('../services/dashboard.service');

exports.resumo = async (req, res, next) => {
  try { res.json(await service.resumo()); } catch (e) { next(e); }
};
exports.agendaHoje = async (req, res, next) => {
  try { res.json(await service.agendaHoje()); } catch (e) { next(e); }
};
exports.faturamentoMensal = async (req, res, next) => {
  try { res.json(await service.faturamentoMensal()); } catch (e) { next(e); }
};
exports.servicosMaisVendidos = async (req, res, next) => {
  try { res.json(await service.servicosMaisVendidos()); } catch (e) { next(e); }
};
