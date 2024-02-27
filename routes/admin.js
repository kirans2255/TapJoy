const express = require('express');
const router = express.Router();
const passport = require('passport');

const adminController = require('../controllers/adminController');
const requireAuth = require('../middleware/requireAuth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the home view
router.get('/admin',adminController.renderHome);

router.get('/admin/forgot-password',adminController.forgotGetPage)

router.post('/admin/forgot-password',adminController.forgotEmailPostPage)

router.post('/admin/resetPassword',adminController.resetPassword)

// Render the dashboard view (requires authentication)
router.get('/admin/dash',requireAuth, isAuthenticated, adminController.renderDashboard);

// Render the profile view (requires authentication)
router.get('/product', adminController.renderProduct);

// Route for handling the signin form submission
router.post('/signin', adminController.handleSignin);

// Google OAuth routes
router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/admin' }), adminController.handleGoogleCallback);

router.get("/admin/success", adminController.successGoogleLogin);
router.get("/admin/failure", adminController.failureGooglelogin);

// Route for handling logout
router.get('/logout', adminController.handleLogout);

module.exports = router;
