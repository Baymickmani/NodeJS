const path = require('path');
const fs = require('fs');
const https = require('http');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const User = require('./models/user');

const MONGODB_URI=`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-vqoq7.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?&w=majority`;
const app = express();
const store = new MongoDBStore({
   uri: MONGODB_URI,
   collection: 'sessions', 
});
const csrfProtection = csrf();

// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/login');
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
app.use(helmet());
app.use(compression());
// app.use(morgan('combined', {stream: accessLogStream})); // use to write logs

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
   session({ secret: 'baymickmanikantasivanagasai', 
             resave: false, 
             saveUninitialized: false, 
             store: store 
         })
)
app.use(csrfProtection);
app.use(flash());


app.use((req,res,next)=> {
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
})

app.use((req,res,next)=>{
   if(!req.session.user) {
      return next();
   }
   User.findById(req.session.user._id)
       .then(user => {
          if(!user) {
             return next();
          }
         req.user = user;
         next();
       })
       .catch(err => { next(new Error(err)) })
})


app.use('/admin',adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500Page);

app.use(errorController.get404Page);

app.use((error, req, res, next) => {
   // res.redirect('/500');
   res.status(500).render('500', 
                    {
                        docTitle: 'Error Occured!', 
                        path: '/500',
                        isAuthenticated: req.session.isLoggedIn
                    });
})

mongoose.connect(MONGODB_URI)
        .then(result => {
         //   https.createServer({key: privateKey, cert:certificate}, app).listen(process.env.PORT || 3000);
         app.listen(process.env.PORT || 3000);
        })
        .catch(err => console.log(err));
