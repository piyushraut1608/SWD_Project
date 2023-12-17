// authMiddleware.js
const jwt = require("jsonwebtoken");
const config = require("./config");
var obj = require('./env.json');
const { func } = require("joi");
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const { logger } = require('./loggingMiddleware.js')



function authorizeJWT(req, res, next) {
  const jwtCookie = req.headers.cookie ? cookie.parse(req.headers.cookie).jwt : null;
  // console.log('req.cookies.jwt in authorizeJWT -->' + jwtCookie) --- For debugging purposes
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  else {
    console.log('Verifying the JWT token now ')
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        logger.error('Forbidden access as JWT authorization failed')
        return res.status(403).json({ message: "Forbidden" });
      }
      else {
        logger.info('JWT Token verified. User Authorized')

        next();
      }
    });
  }
}


function generateJWT(req, res, user) {
  // console.log('user--->'+user)
  const token = jwt.sign({ user }, config.jwtSecret, { expiresIn: 900 });
  try {
    const cookieOptions = {
      httpOnly: true,
      maxAge: 60 * 15 * 1000, // 15 minutes in milliseconds
    };
    res.cookie('jwt', token, cookieOptions);
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
  console.log("generateJWT()>> Generated Token " + token)
  return token;
}


function checkOriginHeader(req, res, next) {
  const requestOrigin = req.get('Origin');
  if (requestOrigin === req.get('Origin')) {
    next();
  }
  else {
    return res.status(403).json({ message: "Invalid Origin Header" });
  }

}

function validateUTF8Middleware(req, res, next) {
  if (req.method === 'POST') {
    // Validate UTF-8 encoding of the request body
    if (!utf8Validate.isValidUtf8(req.body)) {
      return res.status(400).json({ error: 'Invalid UTF-8 encoding in request body' });
    }
    else {
      next();

    }
  }
};

module.exports = { authorizeJWT, generateJWT, checkOriginHeader, validateUTF8Middleware }
