const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');
const User = require('../models/user');

const nodemailer = require('nodemailer');
var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f03467c7c26d16",
    pass: "5fed0047ce0756"
  }
});

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split('=')[1];
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
                path: '/login',
                docTitle: 'Login',
                isAuthenticated: false,
                errorMessage: message,
                oldInput:{ email:'', password: ''},
                validationErrors: []
              });
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    docTitle: 'Signup',
    isAuthenticated: false,
    errorMessage: message,
    oldInput: { email: '', password: '', confirmPassword: ''},
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')
  const email = req.body.email;
  const password = req.body.password;
  const errors= validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      docTitle: 'Login',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password},
      validationErrors: errors.array()
    });
  }
  User.findOne({email: email})
      .then(user => {
        if(!user){
          return res.status(422).render('auth/login', {
            path: '/login',
            docTitle: 'Login',
            isAuthenticated: false,
            errorMessage: 'Invaid email or password.',
            oldInput: { email: email, password: password},
            validationErrors: []
          });
        }
        bcrypt.compare(password, user.password)
              .then(doMatch => {
                if(doMatch) {
                  req.session.isLoggedIn = true;
                  req.session.user = user;
                  return req.session.save((err)=>{
                  console.log(err);
                  res.redirect('/');
                });
                }
                return res.status(422).render('auth/login', {
                  path: '/login',
                  docTitle: 'Login',
                  isAuthenticated: false,
                  errorMessage: 'Invaid email or password.',
                  oldInput: { email: email, password: password},
                  validationErrors: []
                });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
  });
}

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      path: '/signup',
      docTitle: 'Signup',
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({email: email})
      .then(userDoc => {
        if(userDoc) {
          req.flash('error','Email already exists!!')
          return res.redirect('/signup');
        }
        return bcrypt.hash(password, 12)
                     .then(hashedPassword => {
                      const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: []}
                      });
                      return user.save();
                    })
                    .then(result => {
                      res.redirect('/login');
                      transport.sendMail({
                        from: 'learningNodeJS@test.com',
                        to: email,
                        subject: 'Account Created Successfully',
                        text: 'Your Account has been Created Successfully',
                      });
                    })
                    .catch(err => {
                      const error = new Error(err);
                      error.httpStatusCode = 500;
                      return next(error);
                    });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err=>{
    console.log(err);
    res.redirect('/');
  });
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if(message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    docTitle: 'Reset',
    errorMessage: message
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer)=>{
    if(err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
        .then(user=>{
          if(!user) {
            req.flash('error','No account with that email found...');
            return res.redirect('/reset');
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();
        })
        .then(result => {
          res.redirect('/');
          transport.sendMail({
            from: 'learningNodeJS@test.com',
            to: req.body.email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset</p>
                   <p>Click this <a href="http://localhost:3000/reset/${token} ">link</a>to set a new Password</p>`
          });
        })
        .catch(err => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
  })
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: {$gt: Date.now() }})
      .then(user => {
        let message = req.flash('error');
        if(message.length > 0) {
          message = message[0];
        } else {
          message = null;
        }
        res.render('auth/new-password', {
          path: '/new-password',
          docTitle: 'New Password',
          errorMessage: message,
          userId: user._id.toString(),
          passwordToken: token
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({ resetToken: passwordToken, 
                 resetTokenExpiration: {$gt: Date.now()},
                 _id: userId
              })
      .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
      })
      .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
      })
      .then(result => {
        res.redirect('/login');
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
};