const express = require('express');
const tourController = require('../controller/tourController');

const router = express.Router();

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/top-5')
  .get(tourController.top5Tours, tourController.getAllTours);

router.route('/stats').get(tourController.tourStats);

router.route('/year/:year').get(tourController.toursInGivenYear);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
