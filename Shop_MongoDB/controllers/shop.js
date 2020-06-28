const Product = require('../models/product');
// const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
         .then(products => {
          res.render('shop/product-list', {
            prods: products,
            docTitle: 'All Products',
            path: '/products',
            hasProducts: products.length > 0,
            activeShop: true,
            productCSS: true
          })
         })
         .catch(err => {console.log(err)});
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
         .then(product => {
           res.render('shop/product-detail',{
             product: product,
             docTitle: product.title,
             path: "/products"
            })
         })
         .catch(err => console.log(err))
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
         .then(products => {
          res.render('shop/index', {
            prods: products,
            docTitle: 'My Shop',
            path: '/',
          }) ;
         })
         .catch(err => console.log(err));
}

exports.getCart = (req, res, next) => {
  req.user.getCart()
          .then(products => {
                res.render('shop/cart', {
                          path: '/cart',
                          docTitle: 'Your Cart',
                          products: products
                        });
                      })
          .catch(err => console.log(err))
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
         .then(product => {
           return req.user.addToCart(product);
         })
         .then(result => {
           console.log(result);
           res.redirect('/cart');
         })
         .catch(error => console.log(error))
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId)
          .then(result => {
            res.redirect('/cart');
          })
          .catch(error => console.log(error));
};


exports.getOrders = (req, res, next) => {
  req.user.getOrders()
          .then(orders => {
            res.render('shop/orders', {
              path: '/orders',
              docTitle: 'Your Orders',
              orders: orders
            });
          })
          .catch(err => console.log(err))
};


exports.postOrder = (req, res, next) => {
  req.user.addOrder()
          .then(result => {
            res.redirect('/orders');
          })
          .catch(err => console.log(err));
};