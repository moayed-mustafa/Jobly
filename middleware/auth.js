const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')



function authenticateJWT(req, res, next) {
    try {
        // console.log('.......auth working......')
        const token = req.body._token;
        const payload = jwt.verify(token, SECRET_KEY)
        req.user = payload
        return next()

    } catch (e) {
        return next()
    }
}


function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        return next({ status: 401, message: "Unauthorized" });
    }
    else {
        // console.log(req.user)
        return next();
      }
}

function ensureAdmin(req, res, next) {
    if (! req.user ||  req.user.user.is_admin == false) {
        return next({ status: 401, message: "Unauthorized/not admin" });
    }
    else {
        return next();
      }
}

function ensureCorrectUser(req, res, next) {
    if (!req.user || req.user.user.username != req.params.username) {
        return next({ status: 401, message: "Unauthorized/ not the correct user" });
    }
    else {
        return next();
      }
    }





module.exports = {
    authenticateJWT,
    ensureLoggedIn,
    ensureAdmin,
    ensureCorrectUser

    };