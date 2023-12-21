var express = require ('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');
const {logger}=require('./middleware/loggingMiddleware.js')
const { body, check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');


router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());


module.exports = router;

const verifyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many signup requests , please try again after 15 minutes',
});

router.get('/',function(req,res){
    res.render('verify.ejs');
});

router.post('/',verifyLimiter,[
    check('id').trim().escape(),
    check('token').trim().escape()
],function(req,res){
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(error => error.msg);
        //;
        const alertMsg = errors.array()
        res.render('verify.ejs', {
            VerifyAlert: alertMsg
        })

    }
    else {
    // The following function logic verifies the token received in the email, while registration of the admin.
    var email = req.body.id;
    var token = req.body.token;
        db.matchtoken(email,token,function(err,result){
//    console.log(result);
        if (result.length > 0){
            var email = result[0].email;
            var email_status = "verified";
            db.updateverify (email,email_status,function(err,result1){
                logger.info('Email successfully verified for the admin user with email '+email)
                res.redirect('/login');
            });
        }
        else {
            logger.error('Token did not match for the admin user with email '+email+' while email verification')
            res.send('Token did not match');
        }
    });}

});