const request = require('supertest')
const app = require('../../app')

process.env.NODE_ENV === 'test'
const db = require('../../db')

const User = require('../../models/user')
const Job = require('../../models/job')
const Company = require('../../models/company')


let test_job, test_comp,test_user_admin, _token,test_user_not_admin, _token_not_admin
beforeEach(async () => {
    await db.query('DELETE FROM companies')
    await db.query('DELETE FROM jobs')
    await db.query('DELETE FROM users')

    // create a couple of users
    test_user_admin = {
        "username": "test_user_admin",
        "password": "password",
        "first_name": "test_user_admin",
        "last_name": "mustafa",
        "email": "test_user_admin.mustafa@gmail.com",
        "photo_url": "test_user_admin",
        "is_admin": true
    }
    test_user_not_admin = {
        "username": "not_admin",
        "password": "password",
        "first_name": "not_admin",
        "last_name": "mustafa",
        "email": "test_user_admin.mustafa@gmail.com",
        "photo_url": "test_user_admin",
        "is_admin": false
    }
    let result = await User.register(test_user_admin)
    _token = result.token

    let result_not_admin = await User.register(test_user_not_admin)
    _token_not_admin = result_not_admin.token

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
        let res = await request(app).get('/jobs').send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body.result[0]).toHaveProperty('salary', test_job.salary)
    })
    test('get all jobs, user not authenticated', async () => {
        let res = await request(app).get('/jobs').send()
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message", "Unauthorized")
    })

    test('get jobs, query string?search', async () => {
        let res = await request(app).get(`/jobs?search=${test_job.company_handle }`).send({_token})
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs.jobs
        expect(jobs[0]).toHaveProperty('salary', test_job.salary)
    })
    test('get jobs, query string?min_salary', async () => {
        let res = await request(app).get(`/jobs?min_salary=50000`).send({_token})
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs
        expect(jobs[0]).toHaveProperty("title", test_job.title)
    })
    test('get jobs, query string?min_equity', async () => {
        let res = await request(app).get(`/jobs?min_equity=0`).send({_token})
        expect(res.statusCode).toEqual(200)
        const jobs = res.body.jobs
        expect(jobs[0]).toHaveProperty("title", test_job.title)
    })
})


describe('/POST/jobs', () => {
    test('create a new job, user authorized', async () => {
        test_job_post = {
            "title": "test_job__",
            "salary": 75000,
            "equity": 0.1,
            "company_handle": "test",
        }
        test_job_post._token = _token
        const res = await request(app).post(`/jobs`).send(test_job_post)
        expect(res.statusCode).toEqual(201)
        expect(res.body.job).toHaveProperty("title",test_job_post.title)

    })

    test('create a new job, user not authorized', async () => {
        test_job_post = {
            "title": "test_job__",
            "salary": 75000,
            "equity": 0.1,
            "company_handle": "test",
        }
        test_job_post._token = _token_not_admin
        const res = await request(app).post(`/jobs`).send(test_job_post)
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message", "Unauthorized/not admin")

    })

    test('create a new job, test schema validation,  user authorized', async () => {
        test_job_post_2 = {
            "title": "test_job__test",
            "salary": 75000,
            "equity": 0.1,
            "company_handle": "test__test__test__test",
        }
        test_job_post_2._token = _token
        const res = await request(app).post(`/jobs`).send(test_job_post_2 )
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.company_handle does not meet maximum length of 15')

    })
})

describe('PATCH/jobs', () => {
    test('update an existing job, user authorized', async () => {
        const test_patch= {
            "title": "test_job",
            "salary": 85000,
        }
        let get_res = await request(app).get('/jobs').send({_token})
        let id = get_res.body.result[0].id

        test_patch._token = _token

        const res = await request(app).patch(`/jobs/${id}`).send(test_patch)
        expect(res.statusCode).toEqual(200)
        expect(res.body.result).toHaveProperty("salary","85000")

    })

    test('update an existing job, user unauthorized', async () => {
        const test_patch= {
            "title": "test_job",
            "salary": 85000,
        }
        //  I need an authorized usr to get and id
        let get_res = await request(app).get('/jobs').send({_token})
        let id = get_res.body.result[0].id

        test_patch._token = _token_not_admin

        const res = await request(app).patch(`/jobs/${id}`).send(test_patch)
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message","Unauthorized/not admin")

    })
    test('update an existing job, test schema, user authorized', async () => {
        const test_patch_2= {
            "title": "test_job",
            "salary": "85000",
        }
        let get_res = await request(app).get('/jobs').send({_token})
        let id = get_res.body.result[0].id


        test_patch_2._token = _token
        const res = await request(app).patch(`/jobs/${id}`).send(test_patch_2)
        expect(res.statusCode).toEqual(400)
        expect(res.body.message).toContain('instance.salary is not of a type(s) integer' )

    })

})

describe('DELETE/jobs', () => {
    test('delete a job, user authorized', async () => {
        let get_res = await request(app).get('/jobs').send({_token})
        let id = get_res.body.result[0].id
        const res = await request(app).delete(`/jobs/${id}`).send({_token})
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty("status","Deleted")

    })
    test('delete a job, user unauthorized', async () => {
        let get_res = await request(app).get('/jobs').send({_token})
        let id = get_res.body.result[0].id
        const res = await request(app).delete(`/jobs/${id}`).send({_token_not_admin})
        expect(res.statusCode).toEqual(401)
        expect(res.body).toHaveProperty("message","Unauthorized/not admin")
    })
})