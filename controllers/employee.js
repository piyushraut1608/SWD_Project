var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var db = require.main.require ('./models/db_controller');
const { check, validationResult, body } = require('express-validator');
const { authorizeJWT } = require('./middleware/authMiddleware.js')
const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many requests, please try again after 15 minutes',
});
module.exports = router;



router.get('*', function(req, res, next){
	if(req.cookies['username'] == null){
		res.redirect('/login');
	}else{
		next();
	}
});

router.get('/',authorizeJWT,function(req,res){
    db.getAllemployee(function(err,result){
        res.render('employee.ejs',{employee : result});

    });
   
});

router.get('/add',authorizeJWT,function(req,res){
    res.render('add_employee.ejs');
});

router.post('/add',rateLimiter,authorizeJWT,[
    body('name').isAlpha().withMessage('Only Alphabets allowed in Name'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('contact').isMobilePhone().withMessage('ENter valid Phone Number'),
    body('salary').isNumeric().withMessage('Enter only digits for salary')

],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('add_employee.ejs', {
            InvalidEmpAddAlert: alertMsg
        })
    }
    else{
    var name = req.body.name;
    var email = req.body.email;
    var contact = req.body.contact;
    var join_date = req.body.date;
    var role = req.body.role;
    var salary = req.body.salary;

    db.add_employee(name,email,contact,join_date,role,salary,function(err,result){
        console.log('employee inserted!!');
        res.redirect('/employee');
    });}

});


router.get('/leave',authorizeJWT,function(req,res){
    db.getAllLeave(function(err,result){
       
        res.render('leave.ejs',{user : result});
    });
});

router.get('/add_leave',rateLimiter,authorizeJWT,function(req,res){
    res.render('add_leave.ejs');
    
});

router.get('/edit_leave/:id',[
    body('id').isNumeric().trim().escape()
],rateLimiter,authorizeJWT,function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('edit_leave.ejs', {
            InvalidEditLAlert: alertMsg
        })
    }
    else{
    var id = req.params.id;
    db.getleavebyid(id,function(err,result){
        res.render('edit_leave.ejs',{user:result});
    });}
});

router.post('/edit_leave/:id',rateLimiter,authorizeJWT,[
    check('name').notEmpty().trim().escape().isAlpha().withMessage('Only Aplhabets in Name'),
    check('id').notEmpty().trim().escape().isNumeric().withMessage('Only NUmbers Allowed in ID'),
    check('leave_type').notEmpty(),
    check('from').trim().escape().notEmpty().isDate().withMessage('select a date'),
    check('to').trim().escape().notEmpty().isDate().withMessage('select a date'),
    check('reason').trim().escape().notEmpty().withMessage('Specify Reason').isAlpha().withMessage('Only Aplhabets')
],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('edit_leave.ejs', {
            InvalidAddLAlert: alertMsg
        })
    }
    else{
    var id = req.params.id;
    db.edit_leave(id,req.body.name,req.body.leave_type,req.body.from,req.body.to,req.body.reason,function(err,result){
        res.redirect('/employee/leave');
    });}
});

router.get('/delete_leave/:id',rateLimiter,authorizeJWT,[
    body('id').isNumeric().trim().escape().withMessage('Only Numbers Allowed')
],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('delete_leave.ejs', {
            InvalidAddLAlert: alertMsg,
            user:''
        })
    }
    else{
    var id = req.params.id;
    db.getleavebyid(id,function(err,result){

        res.render('delete_leave.ejs' ,{user : result});
    });}
});

router.post('/delete_leave/:id',function(req,res){
    var id = req.params.id;
    
    db.deleteleave(id,function(err,result){
        res.redirect('/employee/leave');
    });

});



router.get('/edit_employee/:id',rateLimiter,function(req,res){
    var id = req.params.id;
    db.getEmpbyId(id,function(err,result){

        res.render('edit_employee.ejs' ,{list : result});
    });
});



router.post('/edit_employee/:id',rateLimiter,[  
    body('name').isAlpha().withMessage('Only Alphabets allowed in Name'),
body('email').isEmail().withMessage('Enter a valid email'),
body('contact').isMobilePhone().withMessage('ENter valid Phone Number'),
body('date').isDate().withMessage('Enter a valid date'),
body('salary').isNumeric().withMessage('Enter only digits for salary')],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('edit_employee.ejs', {
            InvalidEditEMpAlert: alertMsg
        })
    }
    else{
    var id = req.params.id;
    db.editEmp(id,req.body.name,req.body.email,req.body.contact,req.body.date,req.body.role,function(err,result){
        res.redirect('/employee');
    });}

});

router.get('/delete_employee/:id',function(req,res){
    var id = req.params.id;
    db.getEmpbyId(id,function(err,result){

        res.render('delete_employee.ejs' ,{list : result});
    });
});

router.post('/delete_employee/:id',function(req,res){
    var id = req.params.id;
    
    db.deleteEmp(id,function(err,result){
        res.redirect('/employee');
    });

});

router.post('/search',rateLimiter,authorizeJWT,[
    body('key').isAlpha().trim().escape(),
],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('employee.ejs', {
            InvalidEmpSearchAlert: alertMsg,
            employee:''
        })
    }
    else{
    var key = req.body.search;
    db.searchEmp(key,function(err,result){
        console.log(result);
        
        res.render('employee.ejs',{employee : result});
    });
}
});


router.post('/add_leave',rateLimiter,authorizeJWT,[
    check('name').notEmpty().trim().escape().isAlpha().withMessage('Only Aplhabets in Name'),
    check('id').notEmpty().trim().escape().isNumeric().withMessage('Only NUmbers Allowed in ID'),
    check('leave_type').notEmpty(),
    check('from').trim().escape().notEmpty().isDate().withMessage('select a date'),
    check('to').trim().escape().notEmpty().isDate().withMessage('select a date'),
    check('reason').trim().escape().notEmpty().withMessage('Specify Reason').isAlpha().withMessage('Only Aplhabets')
],rateLimiter,function(req,res){

    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
        res.render('add_leave.ejs', {
            InvalidAddLAlert: alertMsg
        })
    }
    else{

    db.add_leave(req.body.name,req.body.id,req.body.leave_type,req.body.from,req.body.to,req.body.reason,function(err,result){
        res.redirect('/employee/leave');
    });}
});