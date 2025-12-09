const db = require('../../db/postgres');
const ctrl = require('./controlador');

module.exports = ctrl(db);