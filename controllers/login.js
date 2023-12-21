var express = require('express');
var home = require('./home');
var mysql = require('mysql');
var session = require('express-session');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require('./models/db_controller');
var sweetalert = require('sweetalert2');
const { body, check, validationResult } = require('express-validator');
const { generateJWT } = require("./middleware/authMiddleware.js")
var obj = require('./middleware/env.json');
const bcrypt = require('bcrypt');
const { loggers, Logger } = require('winston');
var db = require.main.require('./models/db_controller');
const {logger}=require('./middleware/loggingMiddleware.js');
var dbcon=require('../models/dbcon.json')
const dbHost = dbcon.DB_HOST;
const dbUser = dbcon.DB_USER;
const dbPassword = dbcon.DB_PASSWORD;
const dbDatabase = dbcon.DB_DATABASE;





router.get('/', function (req, res) {

    res.render('login.ejs');
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

router.post('/', [
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
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
        response.render('login.ejs', {
            InvalidInputAlert: alertMsg
        })
    }
    else {

        const hashedPassword = await db.getPasswordByUsername(request.body.username);



        if (bcrypt.compare(request.body.password, hashedPassword)) {
            var username = request.body.username;
            logger.info('Hashed Verified for user : '+username)


            if (username && hashedPassword) {
                con.query('select * from admins where username = ? and password = ?', [username, hashedPassword], function (error, results, fields) {
                    if (results.length > 0) {

                        request.session.loggedin = true;
                        request.session.username = username;
                        //console.log('Req.session.username --->>>'+request.session.username) --For debugging purposes
                        response.cookie('username', username);
                        request.cookies['username'] =username;
                        //console.log('RE>COOKIE=='+request.cookies['username']); --For debugging purposes
                        sweetalert.fire('logged In!');

                        const token = generateJWT(request, response, username);
                        obj.token = token;
                        response.redirect('/home');
                        logger.info('User '+username+' logged in')


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