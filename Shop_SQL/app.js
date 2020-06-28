const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const errorController = require('./controllers/error');
// const db=require('./util/database');

const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');
const app = express();

// for the pug
// app.set('view engine', 'pug');
// for the handle bars
// app.engine('hbs',expressHbs({layoutsDir: 'views/layouts', defaultLayout: 'main-layout', extname: 'hbs'}));
// app.set('view engine', 'hbs');
// for the ejs
 app.set('view engine', 'ejs');
// to set the folder in which views are present
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// db testing code
// db.execute('select * from products')
//     .then(result => {
//         console.log(result);
//     })
//     .catch(err => {
//         console.log(err);
//     });

app.use(bodyParser.urlencoded({extended: false}));
//use static paths to integrate external css file in template 
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
   User.findByPk(1)
       .then(user => {
          req.user = user;
          next();
       })
       .catch(err => console.log(err))
})

app.use('/admin',adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404Page);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});

// use {force: true} in sync to remove all tables and add them again with altering
//sequelize.sync({force: true}) 
sequelize.sync() 
         .then(result => {
            return User.findByPk(1);
         })
         .then(user => {
            console.log(user);
            if(!user){
               return User.create({ name: 'Baymick', email: 'dummy@gmail.com'});
            }
            return user;
         })
         .then(user => {
            return user.createCart();
         })
         .then(cart => {
            app.listen(3000);
         })
         .catch(err => console.log(err) )

