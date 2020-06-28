const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    // rootdir can be used or ___dirname can be used as in shop.js
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
    res.render('admin/edit-product', 
              { docTitle: 'Add Product', 
                path:'/admin/add-product',
                activeAddProduct: true,
                productsCSS: true,
                formsCSS: true,
                editing: false
              })
          };

// used for file system  
// exports.postAddProduct = (req, res, next) => {
//     const title = req.body.title;
//     const imageUrl = req.body.imageUrl;
//     const price = req.body.price;
//     const description = req.body.description;
//     const product = new Product(null, title, imageUrl, description, price);
//     product.save();
//     res.redirect('/');
// };

// used with the SQL
// exports.postAddProduct = (req, res, next) => {
//   const title = req.body.title;
//   const imageUrl = req.body.imageUrl;
//   const price = req.body.price;
//   const description = req.body.description;
//   const product = new Product(null, title, imageUrl, description, price);
//   product.save()
//          .then(() => {
//            res.redirect('/');
//          })
//          .catch(err => console.log(error))
// };

// using sequilize
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  // on creating association in app.js with user it creates a method createProduct
  req.user.createProduct({
    title: title,
    price: price, 
    imageUrl: imageUrl,
    description: description
  })
  .then(result => {
    console.log('Created Product');
    res.redirect('/admin/products')
  })
  .catch(err => console.log(err));
};

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;
//   if(!editMode) {
//     return res.redirect('/');
//   }
//   const prodId = req.params.productId;
//   Product.findById(prodId, product => {
//     if(!product) {
//       return res.redirect('/');
//     }
//     res.render('admin/edit-product', 
//             { docTitle: 'Edit Product', 
//               path:'/admin/edit-product',
//               editing: editMode,
//               product: product
//             });
//   });
// };

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if(!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  req.user.getProducts({where: {id: prodId}})
  // Product.findByPk(prodId)
         .then( products => {
          const product = products[0];
          if(!product) {
            return res.redirect('/');
          }
          res.render('admin/edit-product', 
                  { docTitle: 'Edit Product', 
                    path:'/admin/edit-product',
                    editing: editMode,
                    product: product
                  });
        })
         .catch(err => console.log(err));
};

// exports.postEditProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   const updatedTitle = req.body.title;
//   const updatedPrice = req.body.price;
//   const updatedImageUrl = req.body.imageUrl;
//   const updatedDescription = req.body.description;
//   const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDescription, updatedPrice );
//   updatedProduct.save();
//   res.redirect('/admin/products');
// };



exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  Product.findByPk(prodId)
         .then(product => {
           product.title = updatedTitle;
           product.price = updatedPrice;
           product.imageUrl = updatedImageUrl;
           product.description = updatedDescription;
           return product.save();
         })
         .then(result => {
          console.log("Updated the Product");
          res.redirect('/admin/products');
         })
         .catch(err => console.log(err));
};


// exports.getProducts = (req, res, next) => {
//   Product.fetchAll(products => {  
//   res.render('admin/products', 
//             { prods: products, 
//             docTitle: 'Admin Products', 
//             path: '/admin/products', 
//             });
//   });
// }

//Sequilize
exports.getProducts = (req, res, next) => {
  // Product.findAll()
        req.user.getProducts()
         .then(products => {  
            res.render('admin/products', 
                      { 
                        prods: products, 
                        docTitle: 'Admin Products', 
                        path: '/admin/products', 
                      })
                    })
         .catch(err => console.log(err));
};

// exports.postDeleteProducts = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.deleteById(prodId);
//   res.redirect('/admin/products');
// };


exports.postDeleteProducts = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
         .then(product => {
           return product.destroy();
         })
         .then(result => {
           console.log('Product Deleted');
           res.redirect('/admin/products');
         })
         .catch(err => { console.log(err)})
};