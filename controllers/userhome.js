var express = require ('express');
var router = express.Router();
var db = require.main.require ('./models/db_controller');
var bodyPaser = require ('body-parser');
const {authorizeJWT}=require('./middleware/authMiddleware.js')
const { body, check, validationResult} = require('express-validator');
const {isUser}=require('./middleware/rbacMiddleware.js')



router.get('*', function(req, res, next){
	if(req.cookies['username'] == null){
		res.redirect('/userlogin');
	}else{
		next();
	}
});






router.get('/',isUser,authorizeJWT,function(req,res){
    db.getAllDoc(function(err,result){
        db.getallappointment(function(err,result1){
        var total_doc = result.length ;
        var appointment = result1.length;
         
        res.render('userhome.ejs',{doc : total_doc , doclist : result, appointment : appointment, applist : result1});
        });
        //console.log(result.length);
        
    });
   
});




module.exports =router;