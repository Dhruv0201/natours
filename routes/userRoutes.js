const express = require('express');
const userController = require('./../controllers/userController');
const authController = require("../controllers/authController")

const router = express.Router();
router.post('/signup',authController.signup)
router.post('/login',authController.login)
router.get('/logout',authController.logout)
router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetpassword)

router.use(authController.protect);

router.route('/me').get(authController.protect,userController.getMe,userController.getUser);
router.patch('/updatePassword',authController.protect,authController.updatePassword)
router.patch('/updateMe',authController.protect,userController.updateMe)
router.delete('/deleteMe',authController.protect,userController.deleteme)

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
