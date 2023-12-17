var express = require('express');
var router = express.Router();
var db = require.main.require('./models/db_controller');
var bodyPaser = require('body-parser');
const { body, check, validationResult } = require('express-validator');
var obj = require('./middleware/env.json');
const { authorizeJWT } = require('./middleware/authMiddleware.js')
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many requests, please try again after 15 minutes',
});


router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});

router.get('/', function (req, res) {
    db.getallappointment(function (err, result) {
        console.log(result);
        res.render('appointment.ejs', { list: result });
    })

});

router.get('/add_appointment', function (req, res) {
    res.render('add_appointment.ejs');
});

router.post('/add_appointment', rateLimiter, authorizeJWT,
    [
        check('p_name').isString()
            .notEmpty().withMessage('Patient Name cannot be empty')
            .matches(/^[a-zA-Z]+$/).withMessage('Patient Name must contain Only Alphabets'),
        body('p_name').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('d_name').isString().notEmpty().matches('Doctor Name cannot be empty')
            .matches(/^[a-zA-Z]+$/).withMessage('Doctor Name must contain Only Alphabets'),
        body('d_name').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        body('date').notEmpty().withMessage('Date cannot be empty')
            .trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        body('time').notEmpty().withMessage('Time cannot be empty')
            .trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('email').notEmpty().withMessage('EMail cannot be empty')
            .isEmail().withMessage('Please enter a valid email'),
        body('email').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('phone').notEmpty().withMessage('Phone cannot be empty')
            .matches(/^[0-9+]+$/).withMessage('Phone number must contain only numbers 0-9 and a single "+" sign'),



    ],
    function (req, res) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg = errors.array().map(error => error.msg);
           
            const alertMsg = errors.array()
            res.render('add_appointment.ejs', {
                InvalidAppointAlert: alertMsg,
                list: []
            })
        }
        else {
            db.add_appointment(req.body.p_name, req.body.department, req.body.d_name, req.body.date, req.body.time, req.body.email, req.body.phone, function (err, result) {
                res.redirect('/appointment');
            });
        }

    });


router.get('/edit_appointment/:id', rateLimiter, authorizeJWT, function (req, res) {
    var id = req.params.id;
    db.getappointmentbyid(id, function (err, result) {
        console.log(result);
        res.render('edit_appointment.ejs', { list: result });
    });

});

router.post('/edit_appointment/:id',
    [
        check('p_name').isString()
            .notEmpty().matches('Patient Name cannot be empty')
            .matches(/^[a-zA-Z]+$/).withMessage('Patient Name must contain Only Alphabets'),
        body('p_name').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('d_name').isString().notEmpty().matches('Doctor Name cannot be empty')
            .matches(/^[a-zA-Z]+$/).withMessage('Doctor Name must contain Only Alphabets'),
        body('d_name').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        body('date').notEmpty().withMessage('Date cannot be empty')
            .trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        body('time').notEmpty().withMessage('Time cannot be empty')
            .trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('email').notEmpty().withMessage('EMail cannot be empty')
            .isEmail().withMessage('Please enter a valid email'),
        body('email').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
        check('phone').notEmpty().withMessage('Phone cannot be empty')
            .matches(/^[0-9+]+$/).withMessage('Phone number must contain only numbers 0-9 and a single "+" sign'),
        body('id').trim().escape()
            .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),

    ], rateLimiter, authorizeJWT, function (req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMsg = errors.array().map(error => error.msg);
           
            
            const alertMsg = errors.array()
            res.render('edit_appointment.ejs', {
                InvalidAppointAlert: alertMsg,
                list: []
            })
            // res.status(400).json({ errorMsg });    
        }
        else {
            var id = req.params.id;
            db.editappointment(id, req.body.p_name, req.body.department, req.body.d_name, req.body.date, req.body.time, req.body.email, req.body.phone, function (err, result) {
                res.redirect('/appointment');
            });
        }
    });


router.get('/delete_appointment/:id', rateLimiter, authorizeJWT, function (req, res) {
    var id = req.params.id;
    db.getappointmentbyid(id, function (err, result) {
        console.log(result);
        res.render('delete_appointment.ejs', { list: result });
    })

});

router.post('/delete_appointment/:id', [
    check('p_name').isString()
        .notEmpty().matches('Patient Name cannot be empty')
        .matches(/^[a-zA-Z]+$/).withMessage('Patient Name must contain Only Alphabets'),
    body('p_name').trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
    check('d_name').isString().notEmpty().matches('Doctor Name cannot be empty')
        .matches(/^[a-zA-Z]+$/).withMessage('Doctor Name must contain Only Alphabets'),
    body('d_name').trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
    body('date').notEmpty().withMessage('Date cannot be empty')
        .trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
    body('time').notEmpty().withMessage('Time cannot be empty')
        .trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
    check('email').notEmpty().withMessage('EMail cannot be empty')
        .isEmail().withMessage('Please enter a valid email'),
    body('email').trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
    check('phone').notEmpty().withMessage('Phone cannot be empty')
        .matches(/^[0-9+]+$/).withMessage('Phone number must contain only numbers 0-9 and a single "+" sign'),
    body('id').trim().escape()
        .blacklist('*', ';', '-', '_', '!', '%', 'SELECT', 'WHERE', 'JOIN', 'OR', 'UNION', 'BY', 'LIKE'),
], rateLimiter, authorizeJWT, function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(error => error.msg);
       
        const alertMsg = errors.array()
        res.render('delete_appointment.ejs', {
            InvalidAppointAlert: alertMsg
        }) 
    }
    else {

        var id = req.params.id;
        db.deleteappointment(id, function (err, result) {
            res.redirect('/appointment');
        });
    }
})









module.exports = router;