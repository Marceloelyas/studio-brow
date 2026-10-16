const service = require('../services/payments.service');

exports.listRecent = async (req, res, next) => {
  try { res.json(await service.listRecent(Number(req.query.limit) || 20)); } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); }
};
exports.remove = async (req, res, next) => {
  try { await service.remove(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};
