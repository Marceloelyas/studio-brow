const router = require('express').Router();
const ctrl = require('../controllers/payments.controller');
const receiptCtrl = require('../controllers/receipts.controller'); // <-- Importe
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', ctrl.listRecent);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

// Nova rota:
router.get('/:id/receipt', receiptCtrl.generate);

module.exports = router;
