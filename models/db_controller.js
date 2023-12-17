var mysql =require('mysql');
var express = require('express');
const { func } = require('joi');
var router = express.Router();
var dbcon=require('./dbcon.json')
const dbHost = dbcon.DB_HOST;
const dbUser = dbcon.DB_USER;
const dbPassword = dbcon.DB_PASSWORD;
const dbDatabase = dbcon.DB_DATABASE;




var con = mysql.createConnection({

    host : dbHost,
    user : dbUser,
    password : dbPassword,
    database : dbDatabase
});

con.connect(function(err){
    if(err){
        throw err;
        console.log('you are connected');

    }
});

const pool = mysql.createPool({
    host : dbHost,
    user : dbUser,
    password : dbPassword,
    database : dbDatabase,
    connectionLimit: 10,
  });

module.exports.signup = function(username,email,password,status,callback) {
    //var query =  "INSERT INTO `admins`(`username`,`email`,`password`,`email_status`) VALUES ('" + username + "','" + email + "','" + password + "','"+status+"')";
    //con.query(query,callback);
    var query =
    'INSERT INTO `admins`(`username`, `email`, `password`, `email_status`) VALUES (?, ?, ?, ?)';

  con.query(query, [username, email, password, status], callback);
}

module.exports.getuserid = function (email,callback){
    // var query = "select *from verify where email = '"+email+"' ";
    // con.query(query,callback);
    var query = "select * from verify where email = ?";
    con.query(query,email,callback);
}

module.exports.getEmailIdUsers = function(user,callback){

    var query = "select `email` from `users` where `username` = ?";
    con.query(query,user,callback);
}

module.exports.usersgetuserid = function (user,callback){
    // var query = "select *from verify where email = '"+email+"' ";
    // con.query(query,callback);
    var query = "select * from userverify where username = ?";
    con.query(query,user,callback);
    
}

module.exports.getHashedPassword=function(username,callback){

    // var query="select `password` from `admins` where `username` = '"+username+"'";
    // con.query(query,callback);
    var query = "select `password` from `admins` where `username` = ?";
    con.query(query,username,callback);
}

module.exports.verify = function (username,email,token,callback){
    //  var query = "insert into `verify` (`username`,`email`,`token`) values ('"+username+"','"+email+"','"+token+"')";
    //  console.log(query)
    //  con.query(query,callback);
    var query="insert into `verify` (`username`,`email`,`token`) values ( ?, ?, ?)";
    con.query(query,[username,email,token],callback);
}

module.exports.userverify = function (username,token,callback){
    var query="insert into `userverify` (`username`,`token`) values ( ?, ?)";
    con.query(query,[username,token],callback);
}

module.exports.add_doctor= function(first_name,last_name,email,dob,gender,address,phone,image,department,biography,callback){
    // var query = "INSERT INTO `doctor`(`first_name`,`last_name`,`email`,`dob`,`gender`,`address`,`phone`,`image`,`department`,`biography`) values ('"+first_name+"','"+last_name+"','"+email+"','"+dob+"','"+gender+"','"+address+"','"+phone+"','"+image+"','"+department+"','"+biography+"')";
    // con.query(query,callback);
    var query = "INSERT INTO `doctor`(`first_name`,`last_name`,`email`,`dob`,`gender`,`address`,`phone`,`image`,`department`,`biography`) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    con.query(query,[first_name,last_name,email,dob,gender,address,phone,image,department,biography],callback);
    console.log(query);
    
}

module.exports.getAllDoc = function(callback){
    var query = "select * from doctor" ;
    con.query(query,callback);
}

module.exports.getDocbyId = function(id,callback){
    // var query = "select * from doctor where id ="+id;
    var query = "select * from doctor where id = ?";
    con.query(query,id,callback);
}

module.exports.getEmpbyId = function(id,callback){
    var query = "select * from employee where id ="+id;
    con.query(query,callback);
}

module.exports.editDoc = function(id,first_name,last_name,email,dob,gender,address,phone,image,department,biography,callback){
    //var query = "update `doctor` set `first_name`='"+first_name+"', `last_name`='"+last_name+"', `email`='"+email+"', `dob`='"+dob+"',`gender`='"+gender+"',`address`='"+address+"',`phone`='"+phone+"',`image`='"+image+"',`department`='"+department+"',`biography`='"+biography+"' where id="+id;
    var query = "UPDATE `doctor` SET `first_name`=?, `last_name`=?, `email`=?, `dob`=?, `gender`=?, `address`=?, `phone`=?, `image`=?, `department`=?, `biography`=? WHERE id=?";
    con.query(query,[[first_name, last_name, email, dob, gender, address, phone, image, department, biography, id]],callback);
   // console.log(query);
}

module.exports.editEmp = function(id,name,email,contact,join_date,role,callback){
    //var query = "update `employee` set `name`='"+name+"', `email`='"+email+"', `contact`='"+contact+"', `join_date`='"+join_date+"', `role`='"+role+"' where id="+id;
    var query = "UPDATE `employee` SET `name`=?, `email`=?, `contact`=?, `join_date`=?, `role`=? WHERE id=?";
    con.query(query,[name, email, contact, join_date, role, id],callback);
}

module.exports.deleteDoc = function(id,callback){
    //var query = "delete from doctor where id="+id;
    var query = "delete from doctor where id= ?";
    con.query(query,id,callback);
}

module.exports.deleteEmp = function(id,callback){
    // var query = "delete from employee where id="+id;
    var query = "delete from employee where id= ?";
    con.query(query,id,callback);
}

module.exports.deletemed = function(id,callback){
    // var query = "delete from store where id="+id;
    var query = "delete from store where id= ?";
    con.query(query,id,callback);
}

module.exports.postcomplain = function(message,name,email,subject,callback){
    //var query = "insert into complain (message,name,email,subject) values ('"+message+"','"+name+"','"+email+"','"+subject+"')";
    //console.log(query);
    var query = "insert into complain (message,name,email,subject) values (?, ?, ?, ?)";
    con.query(query,[message,name,email,subject],callback);
}

module.exports.getcomplain = function(callback){
    var query = "select * from complain";
    con.query(query,callback);
}


module.exports.add_appointment =function(p_name,department,d_name,date,time,email,phone,callback){
    // var query = "insert into appointment (patient_name,department,doctor_name,date,time,email,phone) values ('"+p_name+"','"+department+"','"+d_name+"','"+date+"','"+time+"','"+email+"','"+phone+"')";
    var query = "insert into appointment (patient_name,department,doctor_name,date,time,email,phone) values (?, ?, ?, ?, ?, ?, ?)";
    con.query(query,[p_name,department,d_name,date,time,email,phone],callback);
}

module.exports.getallappointment = function(callback){
    var query = "select * from appointment";
    con.query(query,callback);
}

 module.exports.searchDoc = function(key,callback){
     var query='SELECT  *from doctor where first_name like "%'+key+'%"';
     con.query(query,callback);
     console.log(query);
 }

 module.exports.searchmed = function(key,callback){
    var query='SELECT  *from store where name like "%'+key+'%"';
    con.query(query,callback);
 }

 module.exports.searchEmp = function(key,callback){
    var query='SELECT  *from employee where name  like "%'+key+'%"' ;
    con.query(query,callback);
    console.log(query);
}


 module.exports.getappointmentbyid = function(id,callback){
    //  var query = "select * from appointment where id="+id;
    var query = "select * from appointment where id= ?";
     console.log(query);
     con.query(query,id,callback);
 }


 module.exports.editappointment = function(id,p_name,department,d_name,date,time,email,phone,callback){
     //var query = "update appointment set patient_name='"+p_name+"',department='"+department+"',doctor_name='"+d_name+"',date='"+date+"',time='"+time+"',email='"+email+"',phone='"+phone+"' where id="+id;
     var query = "UPDATE appointment SET patient_name=?, department=?, doctor_name=?, date=?, time=?, email=?, phone=? WHERE id=?";

     con.query(query,[p_name, department, d_name, date, time, email, phone, id],callback);
 }

 module.exports.deleteappointment = function(id,callback){
     var query = "delete from appointment where id= ?";

     con.query(query,id,callback);
 }



module.exports.findOne =function (email , callback){
   // var query = "select *from admins where email='"+email+"'" ;
   var query = "select *from admins where email= ?" ;
    con.query(query,email,callback);
    console.log(query);
}

module.exports.temp = function(id,email,token,callback){
    // var query = "insert into `temp` (`id`,`email`,`token`) values ('"+id+"','"+email+"','"+token+"')";
    var query = "insert into `temp` (`id`,`email`,`token`) values (?, ?, ?)";
    con.query(query,[id,email,token],callback);
}

module.exports.checktoken=function(token,callback){
    //var query = "select *from temp where token='"+token+"'";
    var query = "select *from temp where token= ?";
    con.query(query,token,callback);
    console.log(query);
}

module.exports.setpassword =function(id,newpassword,callback){
    var query = "update `admins` set `password`= ? where id= ?";
    con.query(query,[id,newpassword],callback);
}

module.exports.add_employee = function(name,email,contact,join_date,role,salary,callback){
    //var query = "Insert into `employee` (`name`,`email`,`contact`,`join_date`,`role`,`salary`) values ('"+name+"','"+email+"','"+contact+"','"+join_date+"','"+role+"','"+salary+"')";
    var query = "INSERT INTO `employee` (`name`, `email`, `contact`, `join_date`, `role`, `salary`) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(query,[name, email, contact, join_date, role, salary],callback);
    console.log(query);
}

module.exports.addMed = function(name,p_date,expire,e_date,price,quantity,callback){
    // var query = "Insert into `store` (name,p_date,expire,expire_end,price,quantity) values('"+name+"','"+p_date+"','"+expire+"','"+e_date+"','"+price+"','"+quantity+"')";
    var query = "INSERT INTO `store` (name, p_date, expire, expire_end, price, quantity) VALUES (?, ?, ?, ?, ?, ?)";
    console.log(query);
    con.query(query,[name, p_date, expire, expire_end, price, quantity],callback);
}

module.exports.getMedbyId =function(id,callback){
    var query = "select * from store where id= ?";
    con.query(query,id,callback);
}

module.exports.editmed =function(id,name,p_date,expire,e_date,price,quantity,callback){
    //var query = "update store set name='"+name+"', p_date='"+p_date+"',expire='"+expire+"' ,expire_end='"+e_date+"',price='"+price+"',quantity='"+quantity+"' where id="+id;
    var query = "UPDATE store SET name=?, p_date=?, expire=?, expire_end=?, price=?, quantity=? WHERE id=?";

    console.log(query);
    con.query(query,[name, p_date, expire, e_date, price, quantity, id],callback);
}

module.exports.getallmed =function (callback){
   // var query = "select *from store order by id desc";
    console.log(query);
    con.query(query,callback);
}


module.exports.getAllemployee = function (callback){
    var query = "select * from employee";
    con.query(query,callback);
}

module.exports.add_leave = function (name,id,type,from,to,reason,callback){
    //var query = "Insert into `leaves` (`employee`,`emp_id`,`leave_type`,`date_from`,`date_to`,`reason`) values ('"+name+"','"+id+"','"+type+"','"+from+"','"+to+"','"+reason+"')";
    var query = "INSERT INTO `leaves` (`employee`, `emp_id`, `leave_type`, `date_from`, `date_to`, `reason`) VALUES (?, ?, ?, ?, ?, ?)";

    console.log(query);
    con.query(query,[name,id,type,from,to,reason],callback);

    
}

module.exports.getAllLeave=function(callback){
    var query = "Select * from leaves";
    con.query(query,callback);
    
}

// module.exports.matchtoken = function(id,token,callback){
//      var query = "select * from `verify` where token='"+token+"' and id="+id;
//      con.query(query,callback);
//     //var query = "SELECT * FROM `verify` WHERE token = ? AND id = ?";
//     //con.query(query,[token,id],callback);
//     console.log("ID "+id+" token "+token)
//     console.log(query);
// }

module.exports.matchtoken = function(email,token,callback){
    // var query = "select * from `verify` where token='"+token+"' and id="+id;
    // con.query(query,callback);
    //console.log("email "+email+" token "+token)
   var query = "SELECT * FROM `verify` WHERE token = ? AND email = ?";
   con.query(query,[token,email],callback);
   
   console.log(query);
}

module.exports.matchtokenUser = function(user,token,callback){
    // var query = "select * from `verify` where token='"+token+"' and id="+id;
    // con.query(query,callback);
    //console.log("email "+email+" token "+token)
   var query = "SELECT * FROM `userverify` WHERE token = ? AND username = ?";
   con.query(query,[token,user],callback);
   
   console.log(query);
}

module.exports.updateverify = function (email,email_status,callback){
    // var query = "update `admins` set `email_status`='"+email_status+"' where `email`='"+email+"'";
    var query = "UPDATE `admins` SET `email_status`=? WHERE `email`=?";

    con.query(query,[email_status, email],callback);
    
}

module.exports.updateverifyUsers = function (email,email_status,callback){
    // var query = "update `admins` set `email_status`='"+email_status+"' where `email`='"+email+"'";
    var query = "UPDATE `users` SET `email_status`=? WHERE `email`=?";

    con.query(query,[email_status, email],callback);
    
}


module.exports.add_dept = function (name,desc,callback){
   // var query = "insert into departments(department_name,department_desc) values ('"+name+"','"+desc+"')";
   var query = "insert into departments(department_name,department_desc) values ( ?, ?)";
    con.query(query,[name, desc],callback);
}


module.exports.getalldept = function (callback){
    var query = "select * from departments";
    con.query(query,callback);
}

module.exports.delete_department = function(id,callback){
    //var query = "delete from departments where id="+id;
    var query = "delete from departments where id= ?";
    con.query(query,id,callback);
}

module.exports.getdeptbyId = function(id,callback){
    // var query = "select * from departments where id="+id;
    var query = "select * from departments where id= ?";
    con.query(query,id,callback);
}

module.exports.edit_dept= function(id,name,desc,callback){
    // var query = "update departments set department_name='"+name+"',department_desc='"+desc+"' where id="+id;
    var query = "UPDATE departments SET department_name=?, department_desc=? WHERE id=?";
    con.query(query,[name, desc, id],callback);
}

module.exports.getuserdetails = function(username,callback){
    //var query = "select * from admins where username='"+username+"'";
    var query = "select * from admins where username= ?";
    con.query(query,username,callback);
    console.log(query);
}

module.exports.edit_profile=function(id,username,email,password,callback){
    //var query = "update admins set username ='"+username+"', email = '"+email+"',password='"+password+"' where id="+id;
    var query = "UPDATE admins SET username=?, email=?, password=? WHERE id=?";

    con.query(query,[username,email,password,id],callback);
    console.log(query);
}

module.exports.getleavebyid = function(id,callback){
    var query = "select * from leaves where id= ?";
    con.query(query,id,callback);
}

module.exports.deleteleave = function(id,callback){
    var query = "delete  from leaves where id= ?";
    con.query(query,id,callback);
}

module.exports.edit_leave = function(id,name,leave_type,from,to,reason,callback){
    //var query = "update leaves set employee='"+name+"',leave_type='"+leave_type+"',date_from='"+from+"',date_to='"+to+"',reason='"+reason+"' where id="+id;
    var query = "UPDATE leaves SET employee=?, leave_type=?, date_from=?, date_to=?, reason=? WHERE id=?";

    con.query(query,[name, leave_type, from, to, reason, id],callback);
}

// Retrieve hashed password by username
module.exports.getPasswordByUsername = async function (username) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT password FROM admins WHERE username = ?', [username], (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results[0].password);
          } else {
            resolve(null); // User not found
          }
        }
      });
    });
  };

  module.exports.getPasswordByUsernameForUser = async function (username) {
    return new Promise((resolve, reject) => {
      pool.query('SELECT password FROM users WHERE username = ?', [username], (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results[0].password);
          } else {
            resolve(null); // User not found
          }
        }
      });
    });
  };

  module.exports.checkEmployeeEmail = (req, res, next) => {
    const email = req.body.email;
  
    con.query('SELECT * FROM employee WHERE email = ?', [email], (err, results) => {
      if (err) throw err;
  
      if (results.length > 0) {
        next(); // Email exists in the employee database
      } else {
        res.status(403).json({ message: 'Email not found in the employee database' });
      }
    });
  };

  module.exports.usersignup = function(username,email,password,mobile,callback) {
    // var query =  "INSERT INTO `users`(`username`,`email`,`password`) VALUES ('" + username + "','" + email + "','" + password + "')";
    var query = "INSERT INTO `users`(`username`, `email`, `password`, `mobile_number`) VALUES (?, ?, ?, ?)";
    con.query(query,[username,email,password,mobile],callback);
}