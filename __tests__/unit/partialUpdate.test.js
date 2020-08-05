const sqlForPartialUpdate = require('../../helpers/partialUpdate')

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
      function () {

    // FIXME: write real tests!
        const query = sqlForPartialUpdate('users', { 'id': 1, 'username': 'moayed' }, 'username', 2)
        expect(query.query).toEqual('UPDATE users SET id=$1, username=$2 WHERE username=$3 RETURNING *')
        expect(query.values).toContain('moayed')
        expect(query.values).toContain(1)

  });
});
