const db = require('../db')
const ExpressError = require('../helpers/expressError')
const sqlForPartialUpdate = require('../helpers/partialUpdate')



// make a class company with a bunch of class and instance methods

class Company{

    // if you encountered more than one case where you need to run methods on an instance
    // better to create a constructor here and run some of the class methods on it later on

        // makes a query to the database and returns all companies
    static async getAll() {
        const results = await db.query(`
        SELECT * FROM companies
        `)
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------


        //  returns company filtered by handle
    static async getByHandle(handle){
        const results = await db.query(`
        SELECT c.handle as company , c.num_employees, c.description, j.title, j.salary, j.equity FROM companies AS c
        JOIN jobs AS j
        ON c.handle = j.company_handle
        WHERE handle = $1
        `, [handle])
        if (results.rowCount == 0) {
            throw new ExpressError(`Company ${handle} does not exist`, 404)
        }
        console.log(results.rows)
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
        // returns companies that has more emloyees than min_employees
    static async getByMinEmp(min_employees){
        const results = await db.query(`
        SELECT handle, name, num_employees FROM companies
        WHERE num_employees > $1
        `, [min_employees])
        if (results.rowCount == 0) {
            throw new ExpressError(`No company found`, 404)
        }
        return results.rows
    }
    //--------------------------------------------------------------------------------------------------------------
        // returns companies that has more emloyees than min_employees
        static async getByMaxEmp(max_employees){
            const results = await db.query(`
            SELECT handle, name, num_employees FROM companies
            WHERE num_employees < $1
            `, [max_employees])

            if (results.rowCount == 0) {
                throw new ExpressError(`No companies found`, 404)
            }
            return results.rows
        }
    //--------------------------------------------------------------------------------------------------------------
    static async betweenMaxAndMin(max_employees, min_employees) {
        if (min_employees > max_employees) {
            throw new ExpressError(`Min is greater that max`, 400)
        }
        const results = await db.query(`
        SELECT handle, name, num_employees FROM companies
        WHERE num_employees BETWEEN $1 AND $2
        `, [min_employees,max_employees])

        if (results.rowCount == 0) {
            throw new ExpressError(`No companies found `, 404)
        }
        return results.rows
    }
//--------------------------------------------------------------------------------------------------------------
    static async create(company) {
        try {
            const result = await db.query(`
        INSERT INTO companies (handle, name, num_employees, description,logo_url)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `, [company.handle, company.name, company.num_employees,company.description, company.logo_url])
        return result.rows[0]
        } catch (e) {
            throw new ExpressError(`value ${company.handle} is taken`, 404)
        }

    }
    //--------------------------------------------------------------------------------------------------------------
    static async update(company, handle) {
        // todo: need to figure out update issue : Violating key on jobs table
        const query = sqlForPartialUpdate('companies', company, 'handle', handle)
        const result = await db.query(query.query, query.values)
        if (result.rowCount == 0) {
            throw new ExpressError('can not update', 404)
        }
        return result.rows[0]

    }
    //--------------------------------------------------------------------------------------------------------------
    static async delete(handle) {
        // sqlForPartialUpdate('users', {'id': 1, 'username': 'moayed'}, 'username', 2)

        const result = await db.query(`
        DELETE FROM companies
        WHERE handle=$1
        `, [handle])

        if (result.rowCount == 0) {
            throw new ExpressError(`Company ${handle} does not exist`, 404)
        }

    }
    //--------------------------------------------------------------------------------------------------------------
}


module.exports = Company