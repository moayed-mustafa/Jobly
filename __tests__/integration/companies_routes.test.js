const request = require('supertest')
const app = require('../../app')

const Company = require('../../models/company')
const User = require('../../models/user')

process.env.NODE_ENV === 'test'
const db = require('../../db')

let test_user_admin, _token,test_user_not_admin, _token_not_admin, test_comp,test_comp1,test_comp2
beforeEach(async () => {
    // create a couple of users
    test_user_admin = {
        "username": "test_user_admin",
        "password": "password",
        "first_name": "test_user_admin",
        "last_name": "mustafa",
        "email": "test_user_admin@gmail.com",
        "photo_url": "test_user_admin",
        "is_admin": true
    }
    test_user_not_admin = {
        "username": "not_admin",
        "password": "password",
        "first_name": "not_admin",
        "last_name": "mustafa",
        "email": "test_user_not_admin@gmail.com",
        "photo_url": "test_user_admin",
        "is_admin": false
    }
    let result = await User.register(test_user_admin)
    _token = result.token

    let result_not_admin = await User.register(test_user_not_admin)
    _token_not_admin = result_not_admin.token
    // create a bunch of companies
    test_comp = {
        "handle": "test",
    "name" : "test Inc.",
    "num_employees":150,
    "description": "testing testing!"
    }
    test_comp1 = {
        "handle": "test1",
    "name" : "test_1 Inc.",
    "num_employees":500,
    "description": "testing testing1!"
    }
    test_comp2 = {
        "handle": "test2",
    "name" : "test_2 Inc.",
    "num_employees":300,
    "description": "testing testing2!"
    }
    await Company.create(test_comp)
    await Company.create(test_comp1)
    await Company.create(test_comp2)

})
afterEach(async () => {
    await db.query('DELETE FROM companies')
    await db.query('DELETE FROM users')

})
afterAll(async () => {
    await db.end()
})


describe('GET/companies', () => {
        // add test with no admin

    test('test reading companies, no query, user authorized', async () => {

        const res = await request(app).get('/companies').send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies.length).toEqual(3)
        expect(res.body.companies[0].handle).toEqual(test_comp.handle)

    })

    test('test reading companies, serach on query ', async () => {
        // create a user
        // todo: this test is not producing the expected behaviour!
        _user_ = {
            "username": "test_",
            "password": "password",
            "first_name": "test_user",
            "last_name": "user",
            "email": "test_user_use@gmail.com",
            "is_admin": true
        }
        let signup = await request(app).post('/auth/signup').send(_user_)
        const _token_ = signup.body.token
        // create a company
        test_post = {
            "handle": "test_post",
            "name" : "test_post_Inc.",
            "num_employees":300,
            "description": "testing this post route right now!",
            "_token": _token_
        }
        const result = await request(app).post(`/companies`).send(test_post)
        // get the company
        let handle = test_post.handle
        const res = await request(app).get(`/companies?search=${handle}`).send({_token:_token_})
        expect(res.statusCode).toEqual(200)
        expect(res.body.company).toHaveProperty("company", test_comp.handle)
        expect(res.body.company).toHaveProperty("description", test_comp.description)

    })
    test('test reading companies, serach on query, company does not exist ', async () => {
       let handle = 'noCompany'
        const res = await request(app).get(`/companies?search=${handle}`).send({_token})
        expect(res.statusCode).toEqual(404)
        expect(res.body).toHaveProperty("message", "Company noCompany does not exist")

    })
    test('test reading companies, min_employees ', async () => {
        const min = 300
        const res = await request(app).get(`/companies?min_employees=${min}`).send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies).toContainEqual({handle:test_comp1.handle, name:test_comp1.name, num_employees:test_comp1.num_employees})

    })
    test('test reading companies, max_employees ', async () => {
        const max = 300
        const res = await request(app).get(`/companies?max_employees=${max}`).send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies).toContainEqual({handle:test_comp.handle, name:test_comp.name, num_employees:test_comp.num_employees})

    })
})
//--------------------------------------------------------------------------------------------------------------
describe('POST/companies', () => {
    // add test with no admin
    test('create a new company, user authorized', async () => {
        test_post = {
            "handle": "test_post",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
        test_post._token = _token
        const res = await request(app).post(`/companies`).send(test_post)
        expect(res.statusCode).toEqual(201)
        expect(res.body.result).toHaveProperty("handle","test_post")

    })

    test('create a new company, user unauthorized', async () => {
        test_post = {
            "handle": "test_post",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
        test_post._token = _token_not_admin
        const res = await request(app).post(`/companies`).send(test_post)
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message", "Unauthorized/not admin")
    })

    test('create a new company, 404', async () => {
        test_post_2 = {
            "handle": "test",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
        test_post_2._token = _token
        const res = await request(app).post(`/companies`).send(test_post_2)
        expect(res.statusCode).toEqual(404)
        expect(res.body).toHaveProperty("message","value test is taken")

    })
    test('create a new company, test schema validation', async () => {
        test_post_3 = {
            "handle": "testing_test_test_test_",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
        test_post_3._token = _token
        const res = await request(app).post(`/companies`).send(test_post_3)
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.handle does not meet maximum length of 15')

    })
})
// --------------------------------------------------------------------------------------------------------------
describe('PATCH/companies', () => {
    // add no admin tests
    test('update an existing company, user authorized', async () => {
        const test_patch= {
            "handle": "thenewtest",
            "description": "updating this description!"
        }
        test_patch._token = _token
        const res = await request(app).patch(`/companies/${test_comp.handle}`).send(test_patch)
        expect(res.statusCode).toEqual(200)
        expect(res.body.result).toHaveProperty("handle",test_patch.handle)
        expect(res.body.result).toHaveProperty("description",test_patch.description)

    })
    test('update an existing company, user unauthorized', async () => {
        const test_patch= {
            "handle": "thenewtest",
            "description": "updating this description!"
        }
        test_patch._token = _token_not_admin
        const res = await request(app).patch(`/companies/${test_comp.handle}`).send(test_patch)
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message", "Unauthorized/not admin")

    })
    test('update an non-existing company', async () => {
        const test_patch_2= {
            "handle": "thenewtest",
            "description": "updating this description!"
        }
        test_patch_2._token = _token
        const res = await request(app).patch(`/companies/NoCompany`).send(test_patch_2)
        expect(res.statusCode).toEqual(404)
        expect(res.body).toHaveProperty('message','can not update')

    })
})
// --------------------------------------------------------------------------------------------------------------
describe('DELETE/companies', () => {
    test('delete a company, user authorized', async () => {
        const res = await request(app).delete(`/companies/${test_comp.handle}`).send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("status","Deleted")

    })
    test('delete a company, user unauthorized', async () => {
        const res = await request(app).delete(`/companies/${test_comp.handle}`).send({_token:_token_not_admin})
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message", "Unauthorized/not admin")

    })
})

