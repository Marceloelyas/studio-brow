const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/clients', require('./clients.routes'));
router.use('/appointments', require('./appointments.routes'));
router.use('/services', require('./services.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/dashboard', require('./dashboard.routes'));
router.use('/professionals', require('./professionals.routes'));
router.use('/contact-messages', require('./contact.routes'));

module.exports = router;
