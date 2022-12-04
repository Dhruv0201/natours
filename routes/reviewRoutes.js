const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require( './../controllers/authController');
const tourRouter= require('../routes/tourRoutes')
const router = express.Router( { mergeParams:true });


router
.route('/')
.get(reviewController.getAllReviews)
.post(
authController.protect,
authController. restrictTo('user'), 
reviewController.setData,
reviewController.createReview);
//  jasdnfkj


router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
    .delete( authController.restrictTo('user', 'admin'),reviewController.deleteReview)
module.exports = router;