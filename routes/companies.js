const express = require('express')
const router = new express.Router()
const schema = require('jsonschema')
const ExpressError = require("../helpers/expressError");
const Company = require('../models/company')
const companiesSchema = require('../schemas/companiesSchema.json')




// set the route

// get all companies, adjust for query string parameters
router.get('/', async (req, res, next) => {

    try {
        const { search, min_employees, max_employees } = req.query
    //  these guys amount to undefined when not send search, min_employess, max_employees
        if (search) {
        // send query with search
            const company = await Company.getByHandle(search)
            return res.json({company})
        }
        if (max_employees && min_employees) {
            const companies = await Company.betweenMaxAndMin(max_employees, min_employees)
            return res.json({companies})
        }



        if (min_employees) {
                    // send query with min_employees
            const companies = await Company.getByMinEmp(min_employees)
            return res.json({companies})
                }
        if (max_employees) {
            const companies = await Company.getByMaxEmp(max_employees)
            return res.json({companies})
            }

    else {
        const companies = await Company.getAll()
        return res.json({companies})
        }
    } catch (e) {
        next (e)
    }
})
//--------------------------------------------------------------------------------------------------------------
// get company by handle
router.get('/:handle', async (req, res, next) => {
    try {
        const {handle} = req.params
        const result = await Company.getByHandle(handle)
        let data = []
        jobs = []
        const {company, description, num_employees} = result[0]
        data.push({company, description, num_employees})
        result.forEach(r => {

             job = { title: r.title, salary: r.salary, equity: r.equity }
             jobs.push(job)
        })
        data.push(jobs)
        res.json({ data })
    } catch (e) {
        next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------

// create a company
router.post('/', async (req, res, next) => {
    try {
        const company = req.body
        const validate = schema.validate(company, companiesSchema)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);

        }
        const result = await Company.create(company)
        return res.status(201).json({ result })
    } catch (e) {
       return  next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------
// create a company
router.patch('/:handle', async (req, res, next) => {
    try {
        const company = req.body
        const result = await Company.update(company, req.params.handle)
        res.json({result})
    } catch (e) {
        next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------
router.delete('/:handle', async (req, res, next) => {
    try {

        await Company.delete(req.params.handle)

        res.json({status: "Deleted"})
    } catch (e) {
        next(e)
    }
})
//--------------------------------------------------------------------------------------------------------------

module.exports = router