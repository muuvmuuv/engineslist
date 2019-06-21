// tslint:disable:no-string-literal

const test = require('ava')
const path = require('path')
const fs = require('fs')
const EngineChecker = require('../dist/engine-checker')

test('Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('Should run with CommonJS import', async t => {
  const checker = new EngineChecker({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await checker.run()

  t.true(tasks['node'].success)
})
