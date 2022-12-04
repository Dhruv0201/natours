const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require ('../controllers/authController')
const reviewRouter = require('../routes/reviewRoutes')
const router = express.Router();
// router.param('id', tourController.checkID);
router.use('/:tourId/reviews',reviewRouter)

router
.route('/top5')
.get(tourController.top5tour,tourController.getAllTours)

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getTourWithin)
router.route('/distance/:latlng/unit/:unit').get(tourController.getdistance)
router
  .route('/')
  .get(authController.protect,tourController.getAllTours)
  .post(tourController.createTour);
router
.route('/tourStats/:statParams')
.get(tourController.getTourStats)

router
.route('/monthlyplan/:year')
.get(authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),tourController.monthlyPlan)


router
  .route('/:id')
  .get(tourController.getTour)
  .patch( authController.protect,
    authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
  .delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour);

 

module.exports = router;
