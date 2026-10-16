const router = require('express').Router();
const ctrl = require('../controllers/appointments.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);
router.delete('/:id', ctrl.remove);

module.exports = router;
