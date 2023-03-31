const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile');

router.get('/', profileController.getUser);

router.post('/add-user', profileController.postUser);

module.exports = router;
