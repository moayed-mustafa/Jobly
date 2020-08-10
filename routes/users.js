const express = require('express')
const router = new express.Router()
const schema = require('jsonschema')
const ExpressError = require("../helpers/expressError");
const User = require('../models/user')

const userUpdateSchema= require('../schemas/userUpdateSchema.json')
const { ensureLoggedIn} = require("../middleware/auth");
const { ensureCorrectUser} = require("../middleware/auth");



router.get('/',ensureLoggedIn, async (req, res, next) => {
    try {
        const users = await User.getAll()
        return res.json({users})
    } catch (e) {
        return next(e)
    }
})

router.get('/:username',ensureLoggedIn, async (req, res, next) => {
    try {

        const user = await User.getByUsername(req.params.username)
        return res.json({user})

    } catch (e) {
        return next(e)
}
})


router.patch('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        const validate = schema.validate(req.body, userUpdateSchema)
        if (!validate.valid) {
            let listOfErrors = validate.errors.map(error => error.stack);
            throw new ExpressError(listOfErrors, 400);
        }
        const user = await User.update(req.body, req.params.username)
        return res.json({user})

    } catch (e) {
        return next(e)
}
})

router.delete('/:username', ensureCorrectUser, async (req, res, next) => {
    try {
        await User.delete(req.params.username)

        res.json({status: "Deleted"})
    } catch (e) {
        next(e)
    }
})






module.exports = router