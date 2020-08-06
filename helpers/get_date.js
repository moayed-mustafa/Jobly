const moment = require('moment')

function getCurrentDate() {
    let time = Date.now()
        let date_obj = new Date(time)
        let date = date_obj.getDate();
        let month = date_obj.getMonth() + 1;
        let year = date_obj.getFullYear();
    return `${year}-${month}-${date}`



}
function getCurrentTime() {
    const date = moment()
    return date.format()
}


// console.log(now)
module.exports = {getCurrentDate, getCurrentTime}