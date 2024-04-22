const express = require('express');
const router = express.Router();
const passport = require('passport');

// const multer = require('multer');
const upload = require('../multer/multer');
const adminController = require('../controllers/adminController');
const product = require('../controllers/product');
const requireAuth = require('../middleware/requireAuth');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Render the home view
router.get('/admin',adminController.renderHome);

router.get('/admin/forgot-password',adminController.forgotGetPage)

router.post('/forgot-password',adminController.forgotEmailPostPage)

router.post('/resetPassword',adminController.resetPassword)

router.get('/admin/category',requireAuth,adminController.renderCategory)

// Render the dashboard view (requires authentication)
router.get('/admin/dash',requireAuth, isAuthenticated, adminController.renderDashboard);
// Render the product view (requires authentication)
router.get('/admin/product',requireAuth, product.renderProduct);

// Route for updating the products
router.put('/admin/product/:id',upload.array('productImage',3),product.updateProduct)
// Route for handling the addproducts form of products
router.post('/addProducts',upload.array('productImage',6), product.handleProduct);
// Route for handling the addCategory form of Category
router.post('/addCategory',upload.array('CategoryImage'), adminController.handleCategory);
// Route for handling the delete form of Product
router.delete('/delete/:id', product.deleteProduct);
// Route for handling the delete form of Category
router.delete('/deletecat/:id', adminController.deleteCategory);
// Route for updating the category
router.put('/admin/category/:id',upload.array('CategoryImage'),adminController.updateCategory)
// router.put('/admin/products/:id', product.editProduct)
// Route for handling the signin form submission
router.post('/signin', adminController.handleSignin);

router.get('/admin/brand',product.renderBrand);

router.post('/addBrand',upload.array('BrandImage'), product.handleBrand);

router.put('/admin/brand/:id',upload.array('BrandImage'),product.updateBrand)

router.delete('/deleteca/:id', product.deleteBrand);

//banner
router.get('/admin/banner',product.renderBanner);

router.post('/addBanner',upload.array('BannerImage'), product.handleBanner);

router.delete('/deleteb/:id', product.deleteBanner);

///order
router.get('/admin/order',adminController.renderOrder);

//coupon
router.get('/admin/coupon',adminController.renderCoupon);

router.post('/addCoupon',adminController.handleCoupon);


// Route for handling logout
router.get('/logout', adminController.handleLogout);

router.post('/updatestatus', adminController.updatestatus);

module.exports = router;
