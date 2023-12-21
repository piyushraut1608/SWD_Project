var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
const { body, check, validationResult} = require('express-validator');
const { authorizeJWT } = require('./middleware/authMiddleware.js')
const rateLimit = require('express-rate-limit');
const {isAdmin}=require('./middleware/rbacMiddleware.js');
const { logger } = require('./middleware/loggingMiddleware.js');

const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit to 5 requests per session
    message: 'Too many requests, please try again after 15 minutes',
});


var db = require.main.require('./models/db_controller');


router.get('*', function (req, res, next) {
    if (req.cookies['username'] == null) {
        res.redirect('/login');
    } else {
        next();
    }
});



var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/assets/images/upload_images"); //here we specify the destination. in this case i specified the current directory
    },
    filename: function (req, file, cb) {
        console.log(file); //log the file object info in console
        cb(null, file.originalname);//here we specify the file saving name. in this case. 
        //i specified the original file name .you can modify this name to anything you want
    }
});

var upload = multer({ storage: storage,
    fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(file.originalname);

    if (allowedExtensions.includes(fileExtension.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PNG and JPEG are allowed.'));
    }
  }, });


router.get('/',isAdmin,authorizeJWT, function (req, res) {

    db.getAllDoc(function (err, result) {
        if (err)
            throw err;
        logger.info(req.cookies.username+' Navigated to Doctors page')
        res.render('doctors.ejs', { list: result })
    });

});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/add_doctor', isAdmin,authorizeJWT,function (req, res) {
    db.getalldept(function (err, result) {
        res.render('add_doctor.ejs', { list: result });
    });


});

router.post('/add_doctor',
upload.single("image"),[
    check('first_name').isString().trim().escape()
    .notEmpty().withMessage('First Name cannot be empty')
    .matches(/^[a-zA-Z]+$/).withMessage('FIrst Name must contain Only Alphabets'),
    check('last_name').isString().trim().escape()
    .notEmpty().withMessage('Last Name cannot be empty')
    .matches(/^[a-zA-Z]+$/).withMessage('Last Name must contain Only Alphabets'),
    check('email').isString().trim().escape().isEmail().withMessage('Enter a valid email'),
    check('dob').trim().isDate().withMessage('Enter valid date in dd/mm/yyyy format'),
    check('address').trim().escape().matches(/^[a-zA-Z0-9\s\-\',.#]+$/).withMessage('Invalid address'),
    check('phone').matches(/^\+(?:[0-9] ?){6,14}[0-9]$/).withMessage('Invalid phone number format'),
    check('biography').matches(/^[A-Za-z.,\/\s]*$/).withMessage('Invalid Input in Biography')


],isAdmin,authorizeJWT,rateLimiter,function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
            res.render('add_doctor.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }
    else{

    db.add_doctor(req.body.first_name, req.body.last_name, req.body.email, req.body.dob, req.body.gender, req.body.address, req.body.phone, req.file.filename, req.body.department, req.body.biography);
    if (db.add_doctor) {
        console.log('1 doctor inserted');
        logger.info('New doctor added by user '+req.cookies(['username']));
    }
    res.redirect('add_doctor');
}

});

router.get('/edit_doctor/:id',isAdmin,authorizeJWT, function (req, res) {
    var id = req.params.id;

    db.getDocbyId(id, function (err, result) {


        res.render('edit_doctor.ejs', { list: result });


    });
});

router.post('/edit_doctor/:id',[
    check('first_name').isString().trim().escape()
    .notEmpty().withMessage('First Name cannot be empty')
    .matches(/^[a-zA-Z]+$/).withMessage('FIrst Name must contain Only Alphabets'),
    check('last_name').isString().trim().escape()
    .notEmpty().withMessage('Last Name cannot be empty')
    .matches(/^[a-zA-Z]+$/).withMessage('Last Name must contain Only Alphabets'),
    check('email').isString().trim().escape().isEmail().withMessage('Enter a valid email'),
    check('dob').trim().isDate().withMessage('Enter valid date in dd/mm/yyyy format'),
    check('address').trim().escape().matches(/^[a-zA-Z0-9\s\-\',.#]+$/).withMessage('Invalid address'),
    check('phone').matches(/^\+(?:[0-9] ?){6,14}[0-9]$/).withMessage('Invalid phone number format'),
    check('biography').matches(/^[A-Za-z.,\/\s]*$/).withMessage('Invalid Input in Biography'),
    body('id').trim().escape()
    .blacklist('/','..','*','<','>'),
    check('id').isNumeric().withMessage('Invalid input in ID')

],authorizeJWT,rateLimiter, function (req, res) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
            res.render('edit_doctor.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }
    else{
    
    var id = req.params.id;
    db.editDoc(id, req.body.first_name, req.body.last_name, req.body.email, req.body.dob, req.body.gender, req.body.address, req.body.phone, req.body.image, req.body.department, req.body.biography, function (err, result) {
        if (err) throw err;
        logger.info('A doctor edited by user '+req.cookies(['username']));
        //res.render('edit_doctor.ejs',{list:result});
        res.redirect('back');
    });
}
});

router.get('/delete_doctor/:id', function (req, res) {
    var id = req.params.id;
    db.getDocbyId(id, function (err, result) {
        res.render('delete_doctor.ejs', { list: result })
    });


});

router.post('/delete_doctor/:id', [
    body('id').trim().escape()
    .blacklist('/','..','*','<','>'),
    check('id').isNumeric().withMessage('Invalid input in ID')
],authorizeJWT,rateLimiter,function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
            res.render('delete_doctor.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }

    else{
    var id = req.params.id;
    db.deleteDoc(id, function (err, result) {
        logger.info('A doctor deleted by user '+req.cookies(['username']));
        res.redirect('/doctors');
    });
}
});

router.get('/',isAdmin,authorizeJWT, function (req, res) {

    db.getAllDoc(function (err, result) {
        if (err)
            throw err;
        res.render('doctors.ejs', { list: result })
    });

});


router.post('/search',[
    body('search').trim().escape()
    .blacklist('/','..','*','<','>','!'),
    check('search').isAlpha().withMessage('Invalid Input in Search')
],authorizeJWT, function (req, res) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const alertMsg = errors.array()
            res.render('doctors.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }else{
    var key = req.body.search;
    db.searchDoc(key, function (err, result) {
//    console.log(result);
        logger.info('A doctor deleted by user '+req.cookies(['username']));
        res.render('doctors.ejs', { list: result });
    });
}
});

module.exports = router;