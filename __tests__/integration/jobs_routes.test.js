const request = require('supertest')
const app = require('../../app')

process.env.NODE_ENV === 'test'
const db = require('../../db')

const Job = require('../../models/job')
const Company = require('../../models/company')

let test_job, test_comp
beforeEach(async () => {
    await db.query('DELETE FROM companies')
    await db.query('DELETE FROM jobs')
    test_comp = {
        "handle": "test",
    "name" : "test Inc.",
    "num_employees":150,
    "description": "testing testing!"
    }
    test_job = {
        "title": "test_job",
        "salary": "75000",
        "equity": "0.1",
        "company_handle": "test",
    }

    await Company.create(test_comp)
    await Job.create(test_job)


})

afterAll(async () => {
    await db.end()
})

describe('GET/jobs', () => {
    test('get all jobs', async () => {
        let res = await request(app).get('/jobs')
        expect(res.statusCode).toEqual(200)
        expect(res.body.result[0]).toHaveProperty('salary', test_job.salary)
    })

    test('get jobs, query string?search', async () => {
        let res = await request(app).get(`/jobs?search=${test_job.company_handle }`)
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs.jobs
        expect(jobs[0]).toHaveProperty('salary', test_job.salary)
    })
    test('get jobs, query string?min_salary', async () => {
        let res = await request(app).get(`/jobs?min_salary=50000`)
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs
        expect(jobs[0]).toHaveProperty("title", test_job.title)
    })
    test('get jobs, query string?min_equity', async () => {
        let res = await request(app).get(`/jobs?min_equity=0`)
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs
        expect(jobs[0]).toHaveProperty("title", test_job.title)
    })
})


describe('/POST/jobs', () => {
    test('create a new job', async () => {
        test_job_post = {
            "title": "test_job__",
            "salary": 75000,
            "equity": 0.1,
            "company_handle": "test",
        }
        const res = await request(app).post(`/jobs`).send(test_job_post)
        expect(res.statusCode).toEqual(201)
        expect(res.body.job).toHaveProperty("title",test_job_post.title)

    })

    test('create a new job, test schema validation', async () => {
        test_job_post_2 = {
            "title": "test_job__test",
            "salary": 75000,
            "equity": 0.1,
            "company_handle": "test__test__test__test",
        }
        const res = await request(app).post(`/jobs`).send(test_job_post_2 )
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.company_handle does not meet maximum length of 15')

    })
})

describe('PATCH/jobs', () => {
    test('update an existing job', async () => {
        const test_patch= {
            "title": "test_job",
            "salary": 85000,
        }
        let get_res = await request(app).get('/jobs')
        let id = get_res.body.result[0].id

        const res = await request(app).patch(`/jobs/${id}`).send(test_patch)
        expect(res.statusCode).toEqual(200)
        expect(res.body.result).toHaveProperty("salary","85000")

    })
    test('update an existing job, test schema', async () => {
        const test_patch= {
            "title": "test_job",
            "salary": "85000",
        }
        let get_res = await request(app).get('/jobs')
        let id = get_res.body.result[0].id

        const res = await request(app).patch(`/jobs/${id}`).send(test_patch)
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.salary is not of a type(s) integer' )

    })

})

describe('DELETE/jobs', () => {
    test('delete a job', async () => {
        let get_res = await request(app).get('/jobs')
        let id = get_res.body.result[0].id
        const res = await request(app).delete(`/jobs/${id}`)
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("status","Deleted")

    })
})