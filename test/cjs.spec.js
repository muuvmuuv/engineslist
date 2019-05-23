// tslint:disable:no-string-literal

const test = require('ava')
const path = require('path')
const fs = require('fs')
const Supervisor = require('../dist/supervisor')

test('Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('Should run with CommonJS import', async t => {
  const supervisor = new Supervisor({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await supervisor.run()

  t.true(tasks['node'].success)
})
