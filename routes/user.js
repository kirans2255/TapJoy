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

router.post('/forget-password',userController.forgotEmailPostPage)

router.get('/brand/:brandName', userController.renderbrand);

router.get('/brands/:brandName', userController.renderbrands);

router.post('/resethePassword',userController.resetPassword)
//wishlist
router.get('/wishlist',requireAuth,userController.renderwishlist);

router.post('/wishlist/:productId',requireAuth ,userController.addToWishlist);

router.delete('/wishlist/:productName',requireAuth,userController.removeFromWishlist)

//filter
router.get('/shops/:category',userController.Getsort)

router.get('/shop/:category',userController.sort)

// Render the dashboard view (requires authentication)
router.get('/',isAuthenticated, userController.renderDashboard);

// Render the profile view (requires authentication)
router.get('/shop',userController.rendershop);

router.get('/shops',userController.rendershops);

router.get('/singleproduct/:id', userController.rendersingleProduct);

router.get('/account',requireAuth, userController.renderAccount);

router.post('/signup', userController.handleSignup);

// Route for handling the signin form submission
router.post('/login', userController.handleSignin);


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
