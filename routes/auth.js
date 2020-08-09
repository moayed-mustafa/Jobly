const express = require('express')
const router = new express.Router()
const schema = require('jsonschema')
const ExpressError = require("../helpers/expressError");

const User = require('../models/user')
const userSchema = require('../schemas/userSchema.json')
const userLoginSchema = require('../schemas/userLoginSchema.json')


// routes for signup and login
router.post('/signup', async (req,res,next,) => {
    try {
        const user = req.body
        const validate = schema.validate(user, userSchema)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        const result = await User.register(user)

        return res.status(201).json(result)
    } catch (e) {
        return next(e)
}
})

router.post('/login', async (req,res,next,) => {
    try {
        const user = req.body
        const validate = schema.validate(user, userLoginSchema)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        const result = await User.authenticate(user)

        return res.json(result)
    } catch (e) {
        return next(e)
}
})










module.exports = router