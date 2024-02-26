const express = require('express');
const router = express.Router();
const passport = require('passport');

const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const requireAuth = require('../middleware/requireAuth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// router.use(requireAuth)

// const preventBackAfterLoginMiddleware = require('../middleware/requireAuth');


// Render the signup view
router.get('/signup',isAuthenticated, adminController.renderSignup);


// Render the home view
router.get('/',isAuthenticated, adminController.renderHome);

router.get('/forgot-password',adminController.forgotGetPage)

router.post('/forgot-password',adminController.forgotEmailPostPage)

router.post('/resetPassword',adminController.resetPassword)

// Render the dashboard view (requires authentication)
router.get('/dash', isAuthenticated, adminController.renderDashboard);


// Render the profile view (requires authentication)
router.get('/product', adminController.renderProduct);

// Route for handling the signin form submission
router.post('/signin', adminController.handleSignin);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), authController.handleGoogleCallback);

// Route for handling the signup form submission
router.post('/signup', adminController.handleSignup);

// Route for handling logout
router.get('/logout', adminController.handleLogout);

module.exports = router;
