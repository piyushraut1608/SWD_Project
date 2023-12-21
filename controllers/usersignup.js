var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require('./models/db_controller');
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var randomToken = require('random-token');
const { body, check, validationResult } = require('express-validator');
var { expressjwt: jwt } = require("express-jwt");
const rateLimit=require('express-rate-limit');
const bcrypt=require('bcrypt')
var obj = require('./middleware/env.json');




router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many signup requests , please try again after 15 minutes',
  });

router.get('/', function (req, res) {
    res.render('usersignup.ejs');
});

// Following function logic handles the signup for the user
router.post('/',signupLimiter,
    [check('username').notEmpty().withMessage("Username is required"),
    check('password').notEmpty().withMessage("Password is required"),
    body('username').isString().trim().escape() // INput Sanitization for HTML entities in Username
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username must contain only alphabets & numbers'), // INput Validation for Username
    body('password').isString().trim().escape() // INput Sanitization for HTML entities in Password
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/^(.*[!@#$%^&*]){1}/).withMessage('Password must contain at least one special character')
        .matches(/^(.*\d){2}/).withMessage('Password must contain at least two numbers'), // Validation for Strong Password Policy
    check('email').notEmpty().trim().escape().isEmail().withMessage('Valid Email required'), //Input Validation for email, // INput Sanitization for HTML entities in Email
    check('mobileNumber').notEmpty().trim().escape()
    
], db.checkEmployeeEmail,async function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg = errors.array().map(error => error.msg);
            const alertMsg = errors.array()
            res.render('usersignup.ejs', {
                PasswordAlert: alertMsg
            })            
        }
        else{
        var email_status = "not_verified";
        var email = req.body.email;
        var username = req.body.username;

        const salt=10;
        const hashedPassword= await bcrypt.hash(req.body.password,salt)
        const mobile = req.body.mobileNumber;
        db.usersignup(req.body.username, req.body.email, hashedPassword,mobile);

        var token = randomToken(8);


    }

    });






module.exports = router;