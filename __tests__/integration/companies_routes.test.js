const request = require('supertest')
const app = require('../../app')

const Company = require('../../models/company')

process.env.NODE_ENV === 'test'
const db = require('../../db')

let test_comp,test_comp1,test_comp2
beforeEach(async () => {
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

})
afterAll(async () => {
    await db.end()
})


describe('GET/companies', () => {
    test('test reading companies, no query ', async () => {

        const res = await request(app).get('/companies')
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies.length).toEqual(3)
        expect(res.body.companies[0].handle).toEqual(test_comp.handle)

    })

    test('test reading companies, serach on query ', async () => {
        handle = test_comp1.handle
        const res = await request(app).get(`/companies?search=${handle}`)
        console.log(res.body)
        expect(res.statusCode).toEqual(200)
        // expect(res.body.company).toHaveProperty("company", test_comp.handle)
        // expect(res.body.company).toHaveProperty("description", test_comp.description)

    })
    test('test reading companies, serach on query, company does not exist ', async () => {
       let handle = 'noCompany'
        const res = await request(app).get(`/companies?search=${handle}`)
        expect(res.statusCode).toEqual(404)
        expect(res.body).toHaveProperty("message", "Company noCompany does not exist")
        // expect(res.body.company).toHaveProperty("description", test_comp.description)

    })
    test('test reading companies, min_employees ', async () => {
        const min = 300
        const res = await request(app).get(`/companies?min_employees=${min}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies).toContainEqual({handle:test_comp1.handle, name:test_comp1.name, num_employees:test_comp1.num_employees})

    })
    test('test reading companies, max_employees ', async () => {
        const max = 300
        const res = await request(app).get(`/companies?max_employees=${max}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies).toContainEqual({handle:test_comp.handle, name:test_comp.name, num_employees:test_comp.num_employees})

    })
})
//--------------------------------------------------------------------------------------------------------------
describe('POST/companies', () => {
    test('create a new company', async () => {
        test_post = {
            "handle": "test_post",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
        const res = await request(app).post(`/companies`).send(test_post)
        expect(res.statusCode).toEqual(201)
        expect(res.body.result).toHaveProperty("handle","test_post")

    })

    test('create a new company, 404', async () => {
        test_post_2 = {
            "handle": "test",
        "name" : "test_post_Inc.",
        "num_employees":300,
        "description": "testing this post route right now!"
        }
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
        const res = await request(app).post(`/companies`).send(test_post_3)
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.handle does not meet maximum length of 15')

    })
})
//--------------------------------------------------------------------------------------------------------------
describe('PATCH/companies', () => {
    test('update an existing company', async () => {
        const test_patch= {
            "handle": "thenewtest",
            "description": "updating this description!"
        }
        const res = await request(app).patch(`/companies/${test_comp.handle}`).send(test_patch)
        expect(res.statusCode).toEqual(200)
        expect(res.body.result).toHaveProperty("handle",test_patch.handle)
        expect(res.body.result).toHaveProperty("description",test_patch.description)

    })
    test('update an non-existing company', async () => {
        const test_patch= {
            "handle": "thenewtest",
            "description": "updating this description!"
        }
        const res = await request(app).patch(`/companies/NoCompany`).send(test_patch)
        expect(res.statusCode).toEqual(404)
        expect(res.body).toHaveProperty('message','can not update')

    })
})
//--------------------------------------------------------------------------------------------------------------
describe('DELETE/companies', () => {
    test('delete a company', async () => {

        const res = await request(app).delete(`/companies/${test_comp.handle}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("status","Deleted")

    })
})

