function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Não autenticado' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (req.session?.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
