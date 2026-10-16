const router = require('express').Router();
const ctrl = require('../controllers/professionals.controller');
const { requireAuth } = require('../middlewares/auth');

router.get('/', requireAuth, ctrl.list);

module.exports = router;
