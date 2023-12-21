var express = require('express');
var home = require('./home.js');
var mysql = require('mysql');
var randomToken = require('random-token');
var session = require('express-session');
var nodemailer = require('nodemailer');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require('./models/db_controller');
var sweetalert = require('sweetalert2');
const { body, check, validationResult } = require('express-validator');
const { generateJWT, checkOriginHeader, authorizeJWT } = require("./middleware/authMiddleware.js")
var obj = require('./middleware/env.json');
const bcrypt = require('bcrypt');
var db = require.main.require('./models/db_controller');
var dbcon=require('../models/dbcon.json')
const dbHost = dbcon.DB_HOST;
const dbUser = dbcon.DB_USER;
const dbPassword = dbcon.DB_PASSWORD;
const dbDatabase = dbcon.DB_DATABASE;
const rateLimit=require('express-rate-limit');

const userLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many signup requests , please try again after 15 minutes',
  });


router.get('/', function (req, res) {

    res.render('userlogin.ejs');
});

var con = mysql.createConnection({

    host : dbHost,
    user : dbUser,
    password : dbPassword,
    database : dbDatabase
});

router.use(session({

    secret: 'secret',
    resave: true,
    saveUninitialized: true

}));


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

//Following function logic handles the login of the user
router.post('/',userLoginLimiter, checkOriginHeader, [
    check('username').isString()
        .trim().escape() // INput Validation to check for HTML Entities
        .notEmpty().withMessage("Username is reequired"),
    check('password').isString()
        .trim().escape()
        .notEmpty().withMessage("Password is reequired"),
    body('username').isString()
        .escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE').withMessage("Invalid Input"),
    body('password').isString()
        .escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE').withMessage("Invalid Input")
], async function (request, response) {
    const errors = validationResult(request);
    console.log(request.get('Origin'))
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
        response.render('userlogin.ejs', {
            InvalidInputAlert: alertMsg
        })
    }
    else {

        const hashedPassword = await db.getPasswordByUsernameForUser(request.body.username);

        if (bcrypt.compare(request.body.password, hashedPassword)) {
            var username = request.body.username;

            if (username && hashedPassword) {
                con.query('select * from users where username = ? and password = ?', [username, hashedPassword], function (error, results, fields) {
                    if (results.length > 0) {

                        request.session.loggedin = true;
                        request.session.username = username;
                        response.cookie('username', username);
                        sweetalert.fire('logged In!');

                        

                        var otp = Math.floor(1000 + Math.random() * 9000);
                        db.userverify(request.body.username, otp);
                        var email;
                        db.getEmailIdUsers(request.body.username, function(err,result){
                            email=result[0].email;
                            console.log(email);

                          
                            
                            var output = `
                    <p>Dear  `+ username + `, </p>
                    <p>We received a login attempt. Please verify the login by entering the OTP in the given link. Your OTP token is given below :  </p>
                   
                    <ul>
                        
                        <li>OTP: `+ otp + `</li>
                    </ul>
                    <p>OTP Verification Link: <a href="http://localhost:3000/userverify"> CLick Here to Verify OTP </a></p>
                    
                    <p><strong>This is an automatically generated mail. Please do not reply back.</strong></p>
                    
                    <p>Regards,</p>
                    <p>H Manager</p>
                        `;
        
                            var transporter = nodemailer.createTransport({
                                host: 'smtp.zoho.eu',
                                port: 465,
                                secure: true, //ssl
                                auth: {
                                    user: obj.emailID,  //Secure coding standard --> no hardcoding
                                    pass: obj.emailPass
                                }
                            });
        
                            var mailOptions = {
        
                                from: 'hospitalsystemie@zohomail.eu',
                                to: email,
                                subject: 'OTP Verification', // Subject line
                                html: output// plain text body
                            };
        
                            transporter.sendMail(mailOptions, function (err, info) {
                                if (err) {
                                    return console.log(err);
                                }
                                console.log(info);
                            });
        
                    
                        });
                       

                    } else {
                        response.send('Incorrect username / password');
                    }
                    response.end();
                });

            } else {
                response.send('please enter user name and password');
                response.end();
            }
        }
    }

});



module.exports = router;