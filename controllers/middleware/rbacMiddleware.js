//middleware/rbacMiddleware.js
var mysql2 =require('mysql');
var dbcon=require('../../models/dbcon.json')
const dbHost = dbcon.DB_HOST;
const dbUser = dbcon.DB_USER;
const dbPassword = dbcon.DB_PASSWORD;
const dbDatabase = dbcon.DB_DATABASE;
const { logger } = require('./loggingMiddleware.js')


var con = mysql2.createConnection({
    host : dbHost,
    user : dbUser,
    password : dbPassword,
    database : dbDatabase
});


const isAdmin = async (req, res, next) => {
    const username  = req.cookies['username']; // Assuming you have a user session
    // console.log('rbacMiddleware() >> req.cookie.username ----->'+req.cookies['username']+"------------username----"+username)

    con.query('SELECT role FROM admins WHERE username = ?', [username], function (error, results, fields) {
        if (results.length > 0 && results[0].role === 'ADMIN') {
            logger.info('Access granted to the resoure as the user '+username+" is "+results[0].role)
           next();
        } else {
            res.status(403).json({ error: 'Access forbidden' });
            logger.error('Access forbidden to username '+username+' as the role is NOT ADMIN')
        }
        //res.end();
    });


  };

  const isUser = async (req, res, next) => {
    const username  = req.cookies['username']; // Assuming you have a user session
    // console.log('rbacMiddleware() >> req.cookie.username ----->'+req.cookies['username']+"------------username----"+username)

  
    con.query('SELECT role FROM users WHERE username = ?', [username], function (error, results, fields) {
        if (results.length > 0 && results[0].role === 'NON_ADMIN') {
            logger.info('Access granted to the resoure as the user '+username+" is "+results[0].role)
           next();


        } else {
            res.status(403).json({ error: 'Access forbidden' });
            logger.error('Access forbidden to username '+username+' as the role is NOT Registered USER')

        }
        //res.end();
    });
  };
  
  module.exports = { isAdmin,isUser };
  