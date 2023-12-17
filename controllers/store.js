var mysql = require('mysql');
var express = require('express');
var cookie = require('cookie-parser');
var db = require.main.require('./models/db_controller');
const { check, validationResult, body } = require('express-validator');
const { authorizeJWT } = require('./middleware/authMiddleware.js')
const rateLimit = require('express-rate-limit');
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many requests, please try again after 15 minutes',
});

var router = express.Router();
router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});

router.get('/', function (req, res) {
    db.getallmed(function (err, result) {
        res.render('store.ejs', { list: result });
    })

});

router.get('/add_med', function (req, res) {
    res.render('add_med.ejs');
});


router.post('/add_med', [
    body('name').isAlpha().trim().escape(),
    body('p_date').isDate().trim().escape(),
    body('expire').isAlpha().trim().escape(),
    body('e_date').isDate().trim().escape(),
    body('price').trim().escape().isNumeric(),
    body('quantity').trim().escape().isNumeric()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('add_med.ejs', {
            InvalidMedSearchAlert: alertMsg,

        })
    }
    else {
        var name = req.body.name;
        var p_date = req.body.p_date;
        var expire = req.body.expire;
        var e_date = req.body.e_date;
        var price = req.body.price;
        var quantity = req.body.quantity;

        db.addMed(name, p_date, expire, e_date, price, quantity, function (err, result) {
            res.redirect('/store');
        });
    }

});

router.get('/edit_med/:id', function (req, res) {
    var id = req.params.id;
    db.getMedbyId(id, function (err, result) {

        res.render('edit_med.ejs', { list: result });
    });
});

router.post('/edit_med/:id', [
    body('name').isAlpha().trim().escape(),
    body('p_date').isDate().trim().escape(),
    body('expire').isAlpha().trim().escape(),
    body('e_date').isDate().trim().escape(),
    body('price').trim().escape().isNumeric(),
    body('quantity').trim().escape().isNumeric(),
    body('id').isNumeric().trim().escape()
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('edit_med.ejs', {
            InvalidMedSearchAlert: alertMsg,
            list:''
        })
    }
    else {
        var id = req.params.id;
        db.editmed(id, req.body.name, req.body.p_date, req.body.expire, req.body.e_date, req.body.price, req.body.quantity, function (err, result) {
            res.redirect('/store');
        });
    }

});

router.get('/delete_med/:id', function (req, res) {
    var id = req.params.id;
    db.getMedbyId(id, function (err, result) {

        res.render('delete_med.ejs', { list: result });
    });
});


router.post('/delete_med/:id', function (req, res) {
    var id = req.params.id;

    db.deletemed(id, function (err, result) {
        res.redirect('/store');
    });

});


router.post('/search', [
    body('key').isAlpha().trim().escape(),
], function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('store.ejs', {
            InvalidMedSearchAlert: alertMsg,
            list: ''
        })
    }
    else {
        var key = req.body.search;
        db.searchmed(key, function (err, result) {
            console.log(result);

            res.render('store.ejs', { list: result });
        });
    }
});

module.exports = router;