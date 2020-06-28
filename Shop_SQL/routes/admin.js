const path = require('path');
const express = require('express');

const rootDir = require('../util/path');
const router = express.Router();
const adminController = require('../controllers/admin');

// /admin/add-product => GET request
router.get('/add-product', adminController.getAddProduct);

router.get('/products', adminController.getProducts);

// /admin/add-product => POST request
router.post('/add-product', adminController.postAddProduct);

router.get('/edit-product/:productId' ,adminController.getEditProduct);

router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProducts);

module.exports = router;