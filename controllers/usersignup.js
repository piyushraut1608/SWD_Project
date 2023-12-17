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

router.post('/',signupLimiter,
    [check('username').notEmpty().withMessage("Username is required"),
    check('password').notEmpty().withMessage("Password is required"),
    body('username').isString().trim().escape() // INput Sanitization for HTML entities in Username
        .matches(/^[a-zA-Z0-9]+$/).withMessage('Username must contain only alphabets & numbers'), // INput Validation for Username
    body('password').isString().trim().escape() // INput Sanitization for HTML entities in Password
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/^(.*[!@#$%^&*]){1}/).withMessage('Password must contain at least one special character')
        .matches(/^(.*\d){2}/).withMessage('Password must contain at least two numbers'), // Input Validation for Strong Password
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
           // res.status(400).json({ errorMsg });
            
        }
        else{
        var email_status = "not_verified";
        var email = req.body.email;
        var username = req.body.username;

        const salt=10;
        const hashedPassword= await bcrypt.hash(req.body.password,salt)
            const mobile = req.body.mobileNumber;
        //db.signup(req.body.username, req.body.email, req.body.password, email_status);  //-----ORIGINAL CODE
        console.log('SIGNUP.js >>>> Hashed PWD>>> '+hashedPassword)
        db.usersignup(req.body.username, req.body.email, hashedPassword,mobile);

        var token = randomToken(8);

        // db.verify(req.body.username, email, token);

        // db.getuserid(email, function (err, result) {
        //     var id = result[0].id;
        //     var output = `
        //     <p>Dear  `+ username + `, </p>
        //     <p>Thanks for sign up. Your verification id and token is given below :  </p>
           
        //     <ul>
        //         <li>User ID: `+ id + `</li>
        //         <li>Token: `+ token + `</li>
        //     </ul>
        //     <p>verify Link: <a href="http://localhost:3000/userverify">Verify</a></p>
            
        //     <p><strong>This is an automatically generated mail. Please do not reply back.</strong></p>
            
        //     <p>Regards,</p>
        //     <p>H Manager</p>
        // `;

        // var transporter = nodemailer.createTransport({
        //     host: 'smtp.zoho.eu',
        //     port: 465,
        //     secure: true, //ssl
        //     auth: {
        //         user: obj.emailID,  //Secure coding standard --> no hardcoding
        //             pass: obj.emailPass
        //     }
        // });    
       
        //     var mailOptions = {

        //         from: 'hospitalsystemie@zohomail.eu',
        //         to: email,
        //         subject: 'Email Verification', // Subject line
        //         html: output// plain text body
        //     };

        //     transporter.sendMail(mailOptions, function (err, info) {
        //         if (err) {
        //             return console.log(err);
        //         }
        //         console.log(info);
        //     });

        //     res.send('Check you email for token to verify');

        // });

    }



        // res.redirect('login');


    });






module.exports = router;