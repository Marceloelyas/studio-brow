const router = require('express').Router();
const ctrl = require('../controllers/client-portal.controller');

// Middleware para verificar se a cliente está logada
function requireClientAuth(req, res, next) {
  if (!req.session?.client) return res.status(401).json({ error: 'Acesso negado. Faça login.' });
  next();
}

router.post('/login', ctrl.login);
router.get('/me', requireClientAuth, ctrl.me);
router.put('/me', requireClientAuth, ctrl.updateMe);
router.get('/appointments', requireClientAuth, ctrl.myAppointments);

module.exports = router;
