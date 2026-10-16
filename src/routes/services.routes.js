const router = require('express').Router();
const ctrl = require('../controllers/services.controller');
const { requireAuth } = require('../middlewares/auth');

// Listagem pública (site público consome)
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Mutações exigem login
router.post('/', requireAuth, ctrl.create);
router.put('/:id', requireAuth, ctrl.update);
router.delete('/:id', requireAuth, ctrl.deactivate);

module.exports = router;
