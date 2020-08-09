const request = require('supertest')
const app = require('../../app')

const Company = require('../../models/company')
const User = require('../../models/user')

process.env.NODE_ENV === 'test'
const db = require('../../db')

// test the auth routes
// test the users routes

let test_user_g, _token,test_user_g_2, _token_not_admin
beforeEach(async () => {
    // create a couple of users
    test_user_g = {
        "username": "test_user",
        "password": "password",
        "first_name": "test_user",
        "last_name": "mustafa",
        "email": "test_user_admin@gmail.com",
        "is_admin": true
    }
    test_user_g_2 = {
        "username": "not_admin",
        "password": "password",
        "first_name": "not_admin",
        "last_name": "mustafa",
        "email": "test_user_not_admin@gmail.com",
        "is_admin": false
    }
    let result = await User.register(test_user_g)
    _token = result.token

    let result_not_admin = await User.register(test_user_g_2)
    _token_not_admin = result_not_admin.token


})
afterEach(async () => {
    await db.query('DELETE FROM users')

})
afterAll(async () => {
    await db.end()
})

describe('Sign up a user', () => {
    test('sign up a user, success', async () => {
        let test_user = {
            "username": "test_signup",
            "password": "password",
            "first_name": "test_signup",
            "last_name": "mustafa",
            "email": "test_user_signup@gmail.com",
            "photo_url": "https://images.unsplash.com/photo-1595333041060-f8284dd3d59e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=621&q=80",
            "is_admin": true
        }

        let result = await request(app).post('/auth/signup').send(test_user)
        expect(result.statusCode).toEqual(201)
        expect(result.body).toEqual(expect.anything())
    })

    test('sign up a user, schema fail', async () => {
        let test_user = {
            "username": "test_signup",
            "password": "password",
            "first_name": "test_signup",
            "last_name": "mustafa",
            "email": "test_user_signup@gmail.com",
            "photo_url": "not a url format",
            "is_admin": false
        }

        let result = await request(app).post('/auth/signup').send(test_user)
        expect(result.statusCode).toEqual(400)
        expect(result.body.message).toContain('instance.photo_url does not conform to the "uri" format' )
    })

})

describe('log in a user, success', () => {
    test('log in a user, success', async () => {

        let result = await request(app).post('/auth/login').send({ username: test_user_g.username, password: test_user_g.password })
        expect(result.statusCode).toEqual(200)
        expect(result.body).toEqual(expect.anything())
    })

    test('log in a user, schema fail', async () => {

        let result = await request(app).post('/auth/login').send({ username: "a_long_name_that_wont_pass", password: test_user_g.password })
        console.log(result.body)
        expect(result.statusCode).toEqual(400)
        expect(result.body.message).toContain('instance.username does not meet maximum length of 12')
    })

})
