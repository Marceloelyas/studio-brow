const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);

router.get('/', ctrl.resumo);
router.get('/agenda-hoje', ctrl.agendaHoje);
router.get('/faturamento-mensal', ctrl.faturamentoMensal);
router.get('/servicos-mais-vendidos', ctrl.servicosMaisVendidos);

module.exports = router;
