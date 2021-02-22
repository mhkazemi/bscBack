const { Pool } = require('pg')
const format = require('pg-format');

const config = require('./config.json')

const pool = new Pool(config)

module.exports = {
  pool,
  format
}
