const db = require('../db')
const ExpressError = require('../helpers/expressError')
const sqlForPartialUpdate = require('../helpers/partialUpdate')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { BCRYPT_WORK_FACTOR } = require('../config')
const {SECRET_KEY } = require('../config')


// class for user related functionalities
class User{

    static async register(data) {
         console.log(data)
        // bcrypt the password
        const hashPw = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR)
        // add to database
         const result = await db.query(`
         INSERT INTO users
         values($1,$2,$3,$4,$5,$6,$7)
         RETURNING username, is_admin
         `, [data.username, hashPw, data.first_name, data.last_name, data.email, data.photo_url, data.is_admin])
        if (result.rowCount == 0) {
            throw new ExpressError('something went wrong', 404)
        }
        // console.log(result)
        // return result.rows[0]
        let username = data.username
        let password = data.password
        return await this.authenticate({username,password})

    }

    static async authenticate(data) {

        const result = await db.query(`
        SELECT username,password , is_admin
        FROM users
        WHERE username = $1
        `, [data.username]);
        let user = result.rows[0]
        if (await bcrypt.compare(data.password, user.password)) {
            // make a jwt
            const token = jwt.sign({ user }, SECRET_KEY)
            return {token}
        }

    }
    static async getAll() {

        const result = await db.query(`
        SELECT username, first_name, last_name email, is_admin
        FROM users
        `);
        return result.rows


    }
    static async getByUsername(username) {

        const result = await db.query(`
        SELECT username, first_name, last_name email, is_admin
        FROM users
        WHERE username = $1
        `, [username]);
        if (result.rowCount == 0) {
            throw new ExpressError(`user ${username} not found`)
        }
        return result.rows[0]


    }

    static async update(user, username) {
        // delete user.token

        const query = sqlForPartialUpdate("users", user, "username", username)
        const result = await db.query(query.query, query.values)
        if (result.rowCount == 0) {
            throw new ExpressError(`can not update ${username}`)
        }
        delete result.rows[0].password
        return result.rows[0]


    }


    static async delete(username) {
        const result = await db.query(`
        DELETE FROM users
        WHERE username=$1
        `, [username])

        if (result.rowCount == 0) {
            throw new ExpressError(`Can't Delete`, 404)
        }

    }


}







module.exports = User