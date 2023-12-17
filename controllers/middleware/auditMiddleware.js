// In a separate file (e.g., auditMiddleware.js)
const fs = require('fs');

function auditMiddleware(req, res, next) {
  const auditLog = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}\n`;

  // Append to an audit log file
  fs.appendFile('audit.log', auditLog, (err) => {
    if (err) {
      console.error('Error writing to audit log:', err);
    }
  });

  next();
}

module.exports = auditMiddleware;
