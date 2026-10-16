const router = require('express').Router();
const ctrl = require('../controllers/payments.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', ctrl.listRecent);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
