const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function jwtMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  const token = tokenFromHeader || req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  jwt.verify(token, config.jwt.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    req.user = decoded;
    next();
  });
};