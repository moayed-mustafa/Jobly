const db = require('../db')
const ExpressError = require('../helpers/expressError')
const sqlForPartialUpdate = require('../helpers/partialUpdate')
// const { getCurrentDate } = require('../helpers/get_date')
// console.log(getCurrentDate())


class Job{

    static async getAll() {
        const results = await db.query(`
        SELECT id, company_handle as company, title,salary,equity FROM jobs
        `)
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
    static async create(job) {
        try {

            const result = await db.query(`
        INSERT INTO jobs (title,salary,equity,company_handle)
        VALUES ($1,$2,$3,$4)
        RETURNING *
        `, [job.title,job.salary,job.equity,job.company_handle])
        return result.rows[0]
        } catch (e) {
            // throw new ExpressError(`value ${company.handle} is taken`, 404)
        }

    }
    //--------------------------------------------------------------------------------------------------------------

    static async getBySearch(handle) {
        const results = await db.query(`
        SELECT title , salary, equity
        FROM jobs
        WHERE company_handle = $1
        `, [handle])

        if (results.rowCount == 0) {
            throw new ExpressError(`Company ${handle} does not exist`,404)
        }
        let data = { company: handle }
        data.jobs = results.rows
        return data
    }
    //--------------------------------------------------------------------------------------------------------------
    static async getByMinSal(sal) {
        const results = await db.query(`
        SELECT company_handle AS company, title , salary
        FROM jobs
        WHERE salary > $1
        `, [sal])

        if (results.rowCount == 0) {
            throw new ExpressError(`Not found`,404)
        }
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
    static async getByMinEqu(equity) {
        const results = await db.query(`
        SELECT company_handle AS company, title ,equity
        FROM jobs
        WHERE equity > $1
        `, [equity])

        if (results.rowCount == 0) {
            throw new ExpressError(`Not found`,404)
        }
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
    static async getByTitle(title) {
        const results = await db.query(`
        SELECT j.salary, j.equity, c.handle as company, c.name, c.description
        FROM jobs as j
        JOIN companies as c
        ON j.company_handle = c.handle
        WHERE j.title = $1;
        `, [title])

        if (results.rowCount == 0) {
            throw new ExpressError(`No job found`,404)
        }
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
    static async update(id,data) {
        const query = sqlForPartialUpdate('jobs', data, 'id', id)

        const result = await db.query(query.query, query.values)
        if (result.rowCount == 0) {
            throw new ExpressError('can not update', 404)
        }
        return result.rows[0]
    }
    //--------------------------------------------------------------------------------------------------------------
    static async delete(id) {

        const result = await db.query(`
        DELETE FROM jobs
        WHERE id=$1
        `, [id])

        if (result.rowCount == 0) {
            throw new ExpressError(`Can't Delete`, 404)
        }

    }
    //--------------------------------------------------------------------------------------------------------------
}



module.exports = Job