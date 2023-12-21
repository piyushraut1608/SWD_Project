var express = require('express');

var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');
const { body, check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many reset requests , please try again after 15 minutes',
});


router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());


module.exports =router;

router.get('/',function(req,res){

    res.render('setpassword.ejs');
});

router.post('/',resetLimiter,[
    check('token').trim().escape(),
],function(req,res){

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMsg = errors.array().map(error => error.msg);
       
        
        const alertMsg = errors.array()
        res.render('setpassword.ejs', {
            PasswordAlert: alertMsg
        })
        // res.status(400).json({ errorMsg });

    }
    else {


    var token = req.body.token;
    db.checktoken(token,function(err,result){
        
        if (result.length > 0 ){

    //    console.log(result);
            var newpassword = req.body.password;
            var id =result[0].id;
            db.setpassword(id,newpassword,function(err,result1){
                if(err){
                   // console.log('token did not match');
                    res.send('token did not match');
                }
                else{
                    res.send('Password has been changed...Go to login page');
                }
                
            });
           
        }
        else {
            res.send('Token didnt match!!!');
        }
           
        
    });
}
});