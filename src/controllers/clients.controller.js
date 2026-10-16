const service = require('../services/clients.service');

exports.list = async (req, res, next) => {
  try { res.json(await service.list(req.query.q)); } catch (e) { next(e); }
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
exports.remove = async (req, res, next) => {
  try { await service.remove(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
};
exports.history = async (req, res, next) => {
  try { res.json(await service.history(req.params.id)); } catch (e) { next(e); }
};
