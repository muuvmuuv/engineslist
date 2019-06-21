// tslint:disable:no-string-literal

const test = require('ava')
const path = require('path')
const fs = require('fs')
const { Engineslist } = require('../dist/engineslist')

test('(CJS) Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('(CJS) Should run with CommonJS import', async t => {
  const engineslist = new Engineslist({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await engineslist.run()

  t.true(tasks['node'].success)
})
