const express = require('express')
const router = new express.Router()
const schema = require('jsonschema')
const ExpressError = require("../helpers/expressError");
const Job = require('../models/job')
const jobsSchema = require('../schemas/jobSchema.json')
const jobsSchemaUpdate = require('../schemas/updateJobSchema.json')



// routs here

router.get('/', async (req, res, next) => {
    try {
        const { search, min_salary, min_equity} = req.query
    //  these guys amount to undefined when not send search, min_employess, max_employees
        if (search) {
        // send query with search
            const jobs = await Job.getBySearch(search)
            return res.json({jobs})
        }




        if (min_salary) {
                    // send query with min_employees
            const jobs = await Job.getByMinSal(min_salary)
            return res.json({jobs})
                }
        if (min_equity) {
            const jobs = await Job.getByMinEqu(min_equity)
            return res.json({jobs})
        }

        const result = await Job.getAll()
        return res.json({result})
    } catch (e) {
        return next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------
// create a job
router.post('/', async (req, res, next) => {
    try {
        const job = req.body
        const validate = schema.validate(job, jobsSchema)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);

        }
        const result = await Job.create(job)
        return res.status(201).json({ job:result})
    } catch (e) {
       return  next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------
router.get('/:title', async (req, res, next) => {
    try {
        const { title } = req.params
        if (title) {
            const results = await Job.getByTitle(title)
            const data = []
            results.forEach(r => {
                let job = {}
                job.job = { title: title, company: r.company, salary: r.salary, equity: r.equity }
                data.push(job)
            })
            return res.json({jobs:data})
        }

    } catch (e) {
        return next(e)
    }
})


//--------------------------------------------------------------------------------------------------------------
router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params
        const data = req.body
        const validate = schema.validate(data, jobsSchemaUpdate)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);

        }
        const result = await Job.update(id, data)
        return res.json({ result})
    } catch (e) {
       return  next(e)
    }
})

//--------------------------------------------------------------------------------------------------------------
router.delete('/:id', async (req, res, next) => {
    try {

        await Job.delete(req.params.id)

        res.json({status: "Deleted"})
    } catch (e) {
        next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------


module.exports = router