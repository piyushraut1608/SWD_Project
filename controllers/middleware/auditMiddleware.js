const fs = require('fs');
function auditMiddleware(req, res, next) {
  const auditLog = `${new Date().toISOString()} - ${req.method} ${req.url} - ${req.ip}\n`;
  fs.appendFile('audit.log', auditLog, (err) => {
    if (err) {
      console.error('Error writing to audit log:', err);
    }
  });
  next();
}
module.exports =  auditMiddleware;
