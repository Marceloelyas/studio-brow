const professionals = require('../models/professionals.model');

exports.list = async (req, res, next) => {
  try { res.json(await professionals.list()); } catch (e) { next(e); }
};
