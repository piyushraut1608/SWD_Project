var mysql =require('mysql');
var express = require ('express');
var cookie = require ('cookie-parser');
var db = require.main.require ('./models/db_controller');
const { authorizeJWT } = require('./middleware/authMiddleware.js')
const rateLimit = require('express-rate-limit');
const { check,validationResult } = require('express-validator');
const {isAdmin}=require('./middleware/rbacMiddleware.js');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many requests, please try again after 15 minutes',
});


var router = express.Router();
router.get('*', function(req, res, next){
	if(req.cookies['username'] == null){
		res.redirect('/login');
	}else{
		next();
	}
});

router.get('/',rateLimiter,authorizeJWT,function(req,res){
 
    res.render ('complain.ejs');
});

router.post('/',[
    check('message').trim().escape().matches(/^[a-zA-Z0-9.,]*$/)
    .withMessage('Only alphabets, numbers, period, and comma are allowed in message'),
    check('name').trim().escape().matches(/^[a-zA-Z0-9.,]*$/)
    .withMessage('Only alphabets, numbers, period, and comma are allowed in name'),
    check('email').isEmail().trim().escape().matches(/^[a-zA-Z0-9.,]*$/)
    .withMessage('Only alphabets, numbers, period, and comma are allowed in email'),
    check('subject').isEmail().trim().escape().matches(/^[a-zA-Z0-9.,]*$/)
    .withMessage('Only alphabets, numbers, period, and comma are allowed in subject'),
    

],rateLimiter,authorizeJWT,isAdmin,function(req,res){

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
        logger.error('Invalid input entered by user '+req.cookies(['username']))
        res.render('complain.ejs', {
            InvalidComplainAlert: alertMsg
        })
    }
    else{

    var message = req.body.message;
    var name = req.body.name;
    var email = req.body.email;
    var subject = req.body.subject;

    db.postcomplain(message,name,email,subject,function(err,result){
        res.redirect('back');
    });
}

});




module.exports = router;