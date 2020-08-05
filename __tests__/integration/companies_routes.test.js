const request = require('supertest')
const app = require('../../app')

const Company = require('../../models/company')

process.env.NODE_ENV === 'test'
const db = require('../../db')

let test_comp,test_comp1,test_comp2
beforeEach(async () => {
    await db.query('DELETE FROM COMPANIES')
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
afterAll(async () => {
    await db.end()
})


describe('GET/companies', () => {
    test('test reading companies, no query ', async () => {

        const res = await request(app).get('/companies')
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies.handle).toEqual(test_comp.handle)
        expect(res.body.companies.num_employees).toEqual(test_comp.num_employees)

    })

    test('test reading companies, handle on query ', async () => {

        const res = await request(app).get(`/companies?handle=${test_comp.handle}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.company.handle).toEqual(test_comp.handle)
        expect(res.body.company.description).toEqual(test_comp.description)

    })
    test('test reading companies, handle on query ', async () => {

        const res = await request(app).get(`/companies?handle=${test_comp.handle}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body.company.handle).toEqual(test_comp.handle)
        expect(res.body.company.description).toEqual(test_comp.description)

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
        console.log(res.body)
        expect(res.statusCode).toEqual(200)
        expect(res.body.companies).toContainEqual({handle:test_comp.handle, name:test_comp.name, num_employees:test_comp.num_employees})

    })
})

