const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');
const requireAuth = require('../middleware/userrequire');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the home view
router.get('/signin',userController.renderHome);

router.get('/signup', userController.renderSignup);

router.get('/forgot-password',userController.forgotGetPage)

router.get('/shop',userController.rendershop);

router.get('/shops',userController.rendershops);

router.get('/brand/:brandName', userController.renderbrand);

router.post('/forget-password',userController.forgotEmailPostPage)

router.post('/resethePassword',userController.resetPassword)

router.get('/brands/:brandName', userController.renderbrands);

// Render the dashboard view (requires authentication)
router.get('/',isAuthenticated, userController.renderDashboard);

router.get('/singleproduct/:id', userController.rendersingleProduct);

router.get('/shops/:category',userController.Getsort)

router.get('/shop/:category',userController.sort)

router.get('/wishlist',requireAuth,userController.renderwishlist);

router.post('/wishlist/:productId',requireAuth ,userController.addToWishlist);

router.delete('/wishlist/:productName',requireAuth,userController.removeFromWishlist)
// Render the profile view (requires authentication)
// Route for handling the signin form submission
router.post('/login', userController.handleSignin);

//varaint color

router.get('/account',requireAuth, userController.renderAccount);

router.post('/signup', userController.handleSignup);

router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));
router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/success",
      failureRedirect: "/failure",
    })
  );
router.get("/success", userController.successGoogleLogin);
router.get("/failure", userController.failureGooglelogin);

// Route for handling logout
router.get('/logoutt', userController.handleLogout);

module.exports = router;
