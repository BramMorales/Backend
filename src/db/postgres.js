const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  ssl: false,
});

async function runQuery(sql, params = []) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(sql, params);
    return rows;
  } catch (err) {
    console.error('[DB ERROR]', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  runQuery
};