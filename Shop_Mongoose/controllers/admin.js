const Product = require('../models/product');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator/check');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', 
            { docTitle: 'Add Product', 
              path:'/admin/add-product',
              activeAddProduct: true,
              productsCSS: true,
              formsCSS: true,
              editing: false,
              hasError: false,
              errorMessage: null,
              validationErrors: []
            })
        };

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', 
                  { docTitle: 'Add Product', 
                    path:'/admin/add-product',
                    editing: false,
                    hasError: true,
                    product: {
                      title: title,
                      imageUrl: imageUrl,
                      price: price,
                      description: description
                    },
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array()
                  });
  }
  const product = new Product({
    title: title,
    description: description,
    price: price,
    imageUrl: imageUrl,
    userId: req.user
  });
  product.save().then(result => { 
    console.log('Created Product');
    res.redirect('/admin/products')
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};


exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
         .then( product => {
          if(!product) {
            return res.redirect('/');
          }
          res.render('admin/edit-product', 
                  { docTitle: 'Edit Product', 
                    path:'/admin/edit-product',
                    editing: editMode,
                    product: product,
                    hasError: false,
                    errorMessage: null,
                    validationErrors: []
                  });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', 
                  { docTitle: 'Edit Product', 
                    path:'/admin/edit-product',
                    editing: true,
                    hasError: true,
                    product: {
                      title: updatedTitle,
                      imageUrl: updatedImageUrl,
                      price: updatedPrice,
                      description: updatedDescription,
                      _id: prodId
                    },
                    errorMessage: errors.array()[0].msg,
                    validationErrors: errors.array()
                  });
  }
  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      product.imageUrl = updatedImageUrl;
      return product.save().then(result => {
        console.log("Updated the Product");
        res.redirect('/admin/products');
       })
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.getProducts = (req, res, next) => {
        Product.find({userId: req.user._id})
        //  .select('title price -_id') // to select only the title, price and remove id
        //  .populate('userId') // to fetch based on the userId
         .then(products => {  
            res.render('admin/products', 
                      { 
                        prods: products, 
                        docTitle: 'Admin Products', 
                        path: '/admin/products'
                      })
                    })
          .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
          });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
         .then(product => {
           if(!product) {
             return next(new Error('Product Not Found'));
           }
           return Product.deleteOne({_id: prodId, userId: req.user._id});
         })
         .then(() => {
           res.status(200).json({message: 'Success!'});
         })
         .catch(err => {
            res.status(500).json({ message: 'Deleting Failed.'});
        });
};