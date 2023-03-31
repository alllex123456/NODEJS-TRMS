const express = require('express');
const router = express.Router();

const statementsController = require('../controllers/statements');

router.get('/', statementsController.getStatements);

module.exports = router;
