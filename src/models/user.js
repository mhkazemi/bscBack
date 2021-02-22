const { pool } = require('../db/postgres')

class User {

  constructor() { }


  async checkDuplicateKey({ username }) {
    try {
      const query = `SELECT * FROM users WHERE username = $1`
      const { rows } = await pool.query(query, [username])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async createUser({ name, username, password, role }) {

    try {
      const values = [name, password, username, role]
      let query = `INSERT INTO users(name, password, username, role)
                   VALUES($1, $2, $3, $4)
                   RETURNING *`
      const { rows } = await pool.query(query, values)

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

    async createStudentUser({ name, username, password, role , parent}) {

    try {
      const values = [name, password, username, role , parent]
      let query = `INSERT INTO users(name, password, username, role, parent)
                   VALUES($1, $2, $3, $4 , $5)
                   RETURNING *`
      const { rows } = await pool.query(query, values)

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async setDefaultRole({ id }) {

    try {
      const query = `INSERT INTO users_roles( user_id, role_id)
                     VALUES($1, (select id from roles where name='user'))
                     RETURNING role_id`
      const { rows } = await pool.query(query, [id])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.detail)
    }
  }

  async findByCredentials({ username }) {

    try {
      const query = `SELECT * FROM users WHERE username = $1`
      const { rows } = await pool.query(query, [username])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.message)
    }
  }

    async findById({ id }) {

    try {
      const query = `SELECT * FROM users WHERE id = $1`
      const { rows } = await pool.query(query, [id])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.message)
    }
  }

  async getRoleId({ id }) {

    try {
      const query = `SELECT role_id FROM users_roles WHERE user_id = $1`
      const { rows } = await pool.query(query, [id])

      return rows[0]

    } catch (e) {
      console.log(e);
      throw new Error(e.message)
    }
  }
}

module.exports = User
