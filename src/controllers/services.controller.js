const service = require('../services/services.service');

exports.list = async (req, res, next) => {
  try { res.json(await service.list(req.query.all === '1')); } catch (e) { next(e); }
};
exports.get = async (req, res, next) => {
  try { res.json(await service.get(req.params.id)); } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
  try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); }
};
exports.deactivate = async (req, res, next) => {
  try { await service.deactivate(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};
