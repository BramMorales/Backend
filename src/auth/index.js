const jwt = require('jsonwebtoken');
const config = require('../config');

const { secret, expiration } = config.jwt;

function generateToken(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Payload inválido para generar el token.');
  }

  try {
    return jwt.sign(payload, secret, { expiresIn: expiration });
  } catch (err) {
    console.error('Error generando JWT:', err);
    throw new Error('No se pudo generar el token.');
  }
}

module.exports = {
  generateToken
};
