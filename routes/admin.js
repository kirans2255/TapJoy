const express = require('express');
const router = express.Router();
const passport = require('passport');

const adminController = require('../controllers/adminController');
const product = require('../controllers/product');
const requireAuth = require('../middleware/requireAuth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the home view
router.get('/admin',adminController.renderHome);

router.get('/admin/forgot-password',adminController.forgotGetPage)

router.post('/forgot-password',adminController.forgotEmailPostPage)

router.post('/resetPassword',adminController.resetPassword)

// Render the dashboard view (requires authentication)
router.get('/admin/dash',requireAuth, isAuthenticated, adminController.renderDashboard);
// Render the product view (requires authentication)
router.get('/admin/product',requireAuth, product.renderProduct);
// Route for handling the addproducts form 
router.post('/addproducts', product.handleProduct);
// Route for handling the delete form 
router.delete('/delete/:id', product.deleteProduct);

router.get('/editProduct', product.editProduct);

router.post('/updateProduct', product.updateProduct);
// Route for handling the signin form submission
router.post('/signin', adminController.handleSignin);

// Google OAuth routes
// router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
// router.get(
//     "/auth/google/callback",
//     passport.authenticate("google", {
//       successRedirect: "/success",
//       failureRedirect: "/failure",
//     })
//   );
// router.get("/success", adminController.successGoogleLogin);
// router.get("/failure", adminController.failureGooglelogin);

// Route for handling logout
router.get('/logout', adminController.handleLogout);

module.exports = router;
