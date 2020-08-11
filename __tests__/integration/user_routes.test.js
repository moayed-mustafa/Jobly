const request = require('supertest')
const app = require('../../app')

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
            "username": "_test_",
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
        expect(result.statusCode).toEqual(400)
        expect(result.body.message).toContain('instance.username does not meet maximum length of 12')
    })

})

describe('GET/users', () => {
    test('get users, success', async () => {

        let result = await request(app).get('/users').send({ _token})
        expect(result.statusCode).toEqual(200)
        expect(result.body.users).toHaveLength(2)
    })
    test('get users, unauthorized', async () => {

        let result = await request(app).get('/users').send({})
        expect(result.statusCode).toEqual(401)
        expect(result.body).toHaveProperty("message", "Unauthorized")
    })

})

describe('GET/users/:username', () => {
    test('get user, success', async () => {

        let result = await request(app).get(`/users/${test_user_g.username}`).send({ _token})
        expect(result.statusCode).toEqual(200)
        expect(result.body.user).toHaveProperty('username',test_user_g.username )
    })
    test('get users, unauthorized', async () => {

        let result = await request(app).get(`/users/${test_user_g.username}`)
        expect(result.statusCode).toEqual(401)
        expect(result.body).toHaveProperty("message", "Unauthorized")
    })

})

describe('Patch/users/:username', () => {
    test('test patch user success', async () => {
        // maybe sign up a user specifically for this route
        test_user_patch = {
            "username": "test_",
            "password": "password",
            "first_name": "test_user",
            "last_name": "patch-me",
            "email": "test_user_pathc@gmail.com",
            "is_admin": false
        }
        let res = await request(app).post('/auth/signup').send(test_user_patch)
        let patch_token = res.body.token
        let data = {
            "username": "test_patch",
            "last_name": "getinpatched",
            "_token": patch_token
        }
        let result = await request(app).patch(`/users/${test_user_patch.username}`).send(data)
        expect(result.statusCode).toEqual(200)
        expect(result.body.user).toHaveProperty('username','test_patch' )
    })

    test('test patch user ,unauthorized', async () => {
        test_user_patch = {
            "username": "test_",
            "password": "password",
            "first_name": "test_user",
            "last_name": "patch-me",
            "email": "test_user_pathc@gmail.com",
            "is_admin": false
        }
        let res = await request(app).post('/auth/signup').send(test_user_patch)
        let data = {
            "username": "test_patch",
            "last_name": "getinpatched",
            "_token": _token
        }
        let result = await request(app).patch(`/users/${test_user_patch.username}`).send(data)
        expect(result.statusCode).toEqual(401)
        expect(result.body.message).toContain("Unauthorized/ not the correct user" )
   })

})

describe('DELETE/', () => {
    test('delete a user, user authorized', async () => {
        test_user_delete = {
            "username": "test_",
            "password": "password",
            "first_name": "test_user",
            "last_name": "delete-me",
            "email": "test_user_delete@gmail.com",
            "is_admin": true
        }
        let result = await request(app).post('/auth/signup').send(test_user_delete)
        const delete_token = result.body.token
        const res = await request(app).delete(`/users/${test_user_delete.username}`).send({_token:delete_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("status","Deleted")

    })
    test('delete a user, user unauthorized', async () => {
        test_user_delete = {
            "username": "test_",
            "password": "password",
            "first_name": "test_user",
            "last_name": "delete-me",
            "email": "test_user_delete@gmail.com",
            "is_admin": true
        }
        let result = await request(app).post('/auth/signup').send(test_user_delete)
        const res = await request(app).delete(`/users/${test_user_delete.username}`).send({_token:_token_not_admin})
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message","Unauthorized/ not the correct user")
    })
})
