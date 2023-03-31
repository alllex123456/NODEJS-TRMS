const express = require('express');
const { check, body } = require('express-validator');
const router = express.Router();

const clientsController = require('../controllers/clients');

router.get('/', clientsController.getClients);
router.get('/:clientId/statement', clientsController.getStatement);
router.get('/:clientId/:orderId', clientsController.getClient);
router.get('/:clientId', clientsController.getClient);

router.post(
  '/add-client',
  [
    body('name').custom((value, { req }) => {
      if (value.trim() === req.body.name.trim()) {
        throw new Error('Clientul este deja inregistrat');
      }
      return true;
    }),
  ],
  clientsController.postClients
);
router.post('/:clientId/:orderId/delete-order', clientsController.postClient);
router.post('/:clientId/:orderId', clientsController.postClient);
router.post('/:clientId', clientsController.postClient);

module.exports = router;
