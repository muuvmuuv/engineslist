// tslint:disable:no-string-literal

import test from 'ava'
import path from 'path'
import fs from 'fs'
import { Supervisor } from '../dist/supervisor.esm'

test('Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('Should run with ESM import', async t => {
  const supervisor = new Supervisor({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await supervisor.run()

  t.true(tasks['node'].success)
})
