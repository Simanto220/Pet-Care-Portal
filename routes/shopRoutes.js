const express = require('express');
const router = express.Router();
const { jwtVerification } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/shopController');

// Products (public)
router.get('/products', ctrl.listProducts);
router.post('/products/seed', ctrl.seedProducts); // optional query ?force=true to clear and reseed
router.post('/products/append', ctrl.appendProducts);

// Cart (protected)
router.get('/cart', jwtVerification, ctrl.getCart);
router.post('/cart/add', jwtVerification, ctrl.addToCart);
router.post('/cart/update', jwtVerification, ctrl.updateCartItem);
router.post('/cart/clear', jwtVerification, ctrl.clearCart);

// Checkout (protected) - mock SSLCommerz
router.post('/checkout', jwtVerification, ctrl.createCheckout);
router.post('/payment/success', jwtVerification, ctrl.paymentSuccess);
router.post('/payment/fail', jwtVerification, ctrl.paymentFail);

// Admin/dev helpers
router.post('/products/image-all', jwtVerification, ctrl.setImageForAllProducts);

//Get Purchase History
router.get('/purchase-history', jwtVerification, ctrl.getPurchaseHistory);

module.exports = router;
