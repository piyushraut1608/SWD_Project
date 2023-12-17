var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
const { body, check, validationResult} = require('express-validator');



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

var upload = multer({ storage: storage });


router.get('/', function (req, res) {

    db.getAllDoc(function (err, result) {
        if (err)
            throw err;
        res.render('doctors.ejs', { list: result })
    });

});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/add_doctor', function (req, res) {
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


],function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // return response.status(422).json({ errors: errors.array() });
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
    }
    res.redirect('add_doctor');
}

});

router.get('/edit_doctor/:id', function (req, res) {
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

], function (req, res) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
            res.render('add_doctor.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }
    else{
    
    var id = req.params.id;
    db.editDoc(id, req.body.first_name, req.body.last_name, req.body.email, req.body.dob, req.body.gender, req.body.address, req.body.phone, req.body.image, req.body.department, req.body.biography, function (err, result) {
        if (err) throw err;

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
],function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
            res.render('add_doctor.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }

    else{
    var id = req.params.id;
    db.deleteDoc(id, function (err, result) {

        res.redirect('/doctors');
    });
}
});







//  router.get('/search',function(req,res){
//      res.rende
//      var key = req.body.search;
//      console.log(key);
//     db.searchDoc(key,function(err, rows, fields) {
//         if (err) throw err;
//       var data=[];
//       for(i=0;i<rows.length;i++)
//         {
//           data.push(rows[i].first_name);
//         }
//         res.end(JSON.stringify(data));
//       });
//     });


router.get('/', function (req, res) {

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
], function (req, res) {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       // return response.status(422).json({ errors: errors.array() });
        const alertMsg = errors.array()
            res.render('doctors.ejs', {
                InvalidDocAlert: alertMsg,
                list:[]
            })
    }else{
    var key = req.body.search;
    db.searchDoc(key, function (err, result) {
        console.log(result);

        res.render('doctors.ejs', { list: result });
    });
}
});

module.exports = router;