const express = require('express');
const router = express.Router();

const schedulerController = require('../controllers/scheduler');

router.get('/', schedulerController.getScheduler);
router.get('/:orderId', schedulerController.getOrder);
router.post('/:orderId/delete-order', schedulerController.postDeleteOrder);
router.get('/:clientId/setRate', schedulerController.getSchedulerRate);

router.post('/add-order', schedulerController.postScheduler);
router.post('/complete-order', schedulerController.postCompleteOrder);
router.post('/edit-order', schedulerController.postEditOrder);

module.exports = router;
