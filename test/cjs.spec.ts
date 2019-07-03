import test from 'ava'

// tslint:disable-next-line:no-var-requires
const { Engineslist } = require('../dist/engineslist')

test('(CJS) Should run with CommonJS import', async (t) => {
  const engineslist = new Engineslist({
    node: '>=1.0.0',
  })

  const tasks = await engineslist.run()

  t.true(tasks['node'].success)
})
