const router = require('express').Router();
const ctrl = require('../controllers/contact.controller');
const { requireAuth } = require('../middlewares/auth');

// Rota pública (formulário do site)
router.post('/', ctrl.create);

// Rotas do painel
router.get('/', requireAuth, ctrl.list);
router.patch('/read-all', requireAuth, ctrl.markAllRead);
router.patch('/:id/read', requireAuth, ctrl.markRead);

module.exports = router;
