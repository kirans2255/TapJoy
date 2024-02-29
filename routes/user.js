const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');
// const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the home view
router.get('/signin',userController.renderHome);

router.get('/signup', userController.renderSignup);

router.get('/forgot-password',userController.forgotGetPage)

router.post('/forget-password',userController.forgotEmailPostPage)

router.post('/resethePassword',userController.resetPassword)

// Render the dashboard view (requires authentication)
router.get('/',isAuthenticated, userController.renderDashboard);

// Render the profile view (requires authentication)
// router.get('/product',requireAuth, userController.renderProduct);

router.post('/signup', userController.handleSignup);

// Route for handling the signin form submission
router.post('/login', userController.handleSignin);


// Google OAuth routes
// router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
// router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), userController.handleGoogleCallback);

// router.get("/success", userController.successGoogleLogin);
// router.get("/failure", userController.failureGooglelogin);

// Route for handling logout
router.get('/logout', userController.handleLogout);

module.exports = router;
