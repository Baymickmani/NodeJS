const express = require('express');
const {check, body} = require('express-validator/check');
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login'
            ,[
                check('email').isEmail().withMessage('Please enter a valid email.'),
                body('password','Enter a valid alphanumeric password').isLength({min: 5}).isAlphanumeric()
             ] 
            ,authController.postLogin);

router.post('/signup', 
        [check('email').
            isEmail().
            withMessage('Please enter a valid email.')
            .normalizeEmail(),
        body('password', 'Please enter a alphanumeric password with atleast 5 characters')
            .isLength({min: 5})
            .isAlphanumeric(),
        body('confirmPassword').custom((value, {req}) => {
            if(value !== req.body.password){
                throw new Error('Password and Confirm Password does not match.')
            }
            return true; 
        })
        ] 
            ,authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;