const authService = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    req.session.user = user;
    res.json(user);
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
};

exports.me = (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Não autenticado' });
  res.json(req.session.user);
};
