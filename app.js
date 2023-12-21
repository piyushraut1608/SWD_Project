var express = require ('express');
var session = require ('express-session');
var cookie = require ('cookie-parser');
var path = require ('path');
var ejs= require ('ejs');
var multer = require('multer');
var path = require ('path');
var async = require ('async');
var nodmailer = require ('nodemailer');
var crypto = require ('crypto');
var expressValidator = require ('express-validator');
var  sweetalert = require('sweetalert2');
const cookieParser = require('cookie-parser');
const winston = require('winston');
const morgan = require('morgan');
const auditMiddleware = require('./controllers/middleware/auditMiddleware.js');
const https = require('https');
const fs = require('fs');
const privateKey = fs.readFileSync('./certs/server.key', 'utf8');
const certificate = fs.readFileSync('./certs/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);
const port=3000;
var app = express();
const helmet = require('helmet');


const serverOptions = {
  key: fs.readFileSync('localhost.key'),
  cert: fs.readFileSync('localhost.crt')
};
var server = https.createServer(serverOptions, app);




app.use(helmet()); // sets HTTP Headers for security against CSRF, CORS
app.use(helmet({
    frameguard: {
      action: 'deny' //mitigation for ClickJAcking
    }
  }));



var bodyParser = require ('body-parser');
app.use(cookieParser());


app.use(morgan('combined'));
app.use(auditMiddleware);

var  login = require ('./controllers/login');
var  home = require ('./controllers/home');
var  signup = require ('./controllers/signup');
var add_doc = require('./controllers/add_doctor');
var  doc_controller = require ('./controllers/doc_controller');
var db = require ('./models/db_controller');
var reset = require('./controllers/reset_controller');
var set = require('./controllers/set_controller');
var employee = require ('./controllers/employee.js');
var logout = require ('./controllers/logout');
var verify = require ('./controllers/verify');
var store = require ('./controllers/store');
var landing = require ('./controllers/landing');
var complain = require ('./controllers/complain');
var inbox = require ('./controllers/inbox');
var appointment = require ('./controllers/appointment');
var usersignup=require('./controllers/usersignup.js');
var userlogin=require('./controllers/userlogin.js')
var receipt = require ('./controllers/receipt');
var chat = require ('./controllers/chat');
var userhome=require('./controllers/userhome.js');
var userverify=require('./controllers/userverify.js')

var app = express();

app.set('view engine ', 'ejs');




app.use(express.static('./public'));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookie());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'Strict', // or 'Lax'
    secure: true, // ensure cookies are only sent over HTTPS
  },
}));


app.use('/login' ,login);
app.use('/home' , home);
app.use('/signup' , signup);
app.use('/doctors', doc_controller);
app.use('/resetpassword' ,reset);
app.use('/setpassword',set);
app.use('/employee',employee);
app.use ('/logout',logout);
app.use ('/verify', verify);
app.use ('/store',store);
app.use ('/',landing);
app.use ('/complain',complain);
app.use ('/inbox',inbox);
app.use ('/appointment',appointment);
app.use('/receipt',receipt);
app.use('/usersignup',usersignup);
app.use('/userlogin',userlogin);
app.use('/userhome',userhome);
app.use('/userverify',userverify)


app.listen(3000,serverOptions,function(){
  console.log('Server Started on http://localhost:3000')
})

