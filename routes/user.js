const express = require('express');
const router = express.Router();
const passport = require('passport');

const userController = require('../controllers/userController');
const requireAuth = require('../middleware/userrequire');
const block = require('../middleware/block');
const { isAuthenticated } = require('../middleware/authMiddleware');


// Render the home view
router.get('/signin',block,userController.renderHome);

router.get('/signup',block, userController.renderSignup);

router.get('/forgot-password',block,userController.forgotGetPage)

router.get('/tablet',block,userController.rendershop);

router.get('/phone',block,userController.rendershops);

router.get('/brand/:brandName',block, userController.renderbrand);

router.post('/forget-password',userController.forgotEmailPostPage)

router.post('/resethePassword',userController.resetPassword)

router.get('/brands/:brandName',block, userController.renderbrands);

// Render the dashboard view (requires authentication)
router.get('/',isAuthenticated, userController.renderDashboard);

router.get('/singleproduct/:id',block, userController.rendersingleProduct);

router.get('/phone/:category',block,userController.Getsort)

router.get('/tablet/:category',block,userController.sort)

router.get('/wishlist',block,requireAuth,userController.renderwishlist);

router.post('/wishlist/:productId',requireAuth ,userController.addToWishlist);

router.delete('/wishlist/:productId',requireAuth,userController.removeFromWishlist)
// Render the profile view (requires authentication)
// Route for handling the signin form submission
router.post('/login', userController.handleSignin);

//varaint color

//contact

router.get('/contact', block,userController.renderContact);

router.post('/send-mail',requireAuth,userController.handleContact)

//////////////////
//About

router.get('/about',block, userController.renderAbout);

////////////////////////////////////
//Cart

router.get('/cart',block,requireAuth, userController.renderCart);

router.post('/cart/:productId',requireAuth ,userController.addToCart);

router.get('/account',block,requireAuth, userController.renderAccount);


router.put('/updateQuantity',requireAuth,userController.updateQuantity)

router.delete('/cart/:productId',requireAuth,userController.removeFromCart)

//checkout


router.get('/checkout',block,requireAuth, userController.rendercheckout);

//Address

router.post('/address',requireAuth ,userController.Address);

router.delete('/deleteAddress/:id',userController.deleteAddress)

router.put('/user/address/:id',userController.updateAddress)


///////COD
router.post('/placeOrder',requireAuth ,userController.Cod);

router.post('/razorpay/placeOrder',requireAuth ,userController.razorpaypayment);

router.post('/razorpay/placeOrderdb',requireAuth ,userController.placeorder);



router.post('/signup', userController.handleSignup);
//coupon
router.post('/coupon', userController.validateCoupon);

///////
//order

router.post('/admin/cancel', userController.cancelOrder);

router.get('/order/:id',block,userController.fetchOrder);

///search

router.post('/search', userController.search);


//////////

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
