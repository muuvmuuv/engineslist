// tslint:disable:no-string-literal

import test from 'ava'
import path from 'path'
import fs from 'fs'
import EngineChecker from '../dist/engine-checker.esm'

test('Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('Should run with ESM import', async t => {
  const checker = new EngineChecker({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await checker.run()

  t.true(tasks['node'].success)
})
