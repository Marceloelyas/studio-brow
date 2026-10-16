const router = require('express').Router();
const ctrl = require('../controllers/clients.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.get('/:id/appointments', ctrl.history);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
