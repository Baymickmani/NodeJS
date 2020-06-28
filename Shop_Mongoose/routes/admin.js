const path = require('path');
const express = require('express');
const {body} = require('express-validator/check');

const rootDir = require('../util/path');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts);

router.post('/add-product', 
            isAuth,
            [ body('title','Please provide title only in Alphanumeric')
                .isString()
                .isLength({min: 3})
                .trim(),
              body('price', 'Please provide a valid price')
              .isFloat(),
              body('description', 'Please input min of 10 chars')
              .isLength({min: 10})
              .trim()
            ], 
            adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product', 
            isAuth,
            [ body('title', 'Please provide title only in Alphanumeric')
            .isString()
            .isLength({min: 3})
            .trim(),
            body('price', 'Please provide a valid price')
            .isFloat(),
            body('description', 'Please input min of 10 chars')
            .isLength({min: 10})
            .trim()
            ],
            adminController.postEditProduct);

router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;