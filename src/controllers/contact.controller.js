const service = require('../services/contact.service');

exports.list = async (req, res, next) => {
  try { res.json(await service.list()); } catch (e) { next(e); }
};
exports.create = async (req, res, next) => {
  try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); }
};
exports.markRead = async (req, res, next) => {
  try { res.json(await service.markRead(req.params.id)); } catch (e) { next(e); }
};
exports.markAllRead = async (req, res, next) => {
  try { await service.markAllRead(); res.json({ ok: true }); } catch (e) { next(e); }
};
