// tslint:disable:no-string-literal

import test from 'ava'
import path from 'path'
import fs from 'fs'
import { Engineslist } from '../dist/engineslist.esm'

test('(ESM) Compiled code is available', async t => {
  const distPath = path.resolve(__dirname, '../dist')
  const exists = await fs.existsSync(distPath)

  t.true(exists)
})

test('(ESM) Should run with ESM import', async t => {
  const engineslist = new Engineslist({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await engineslist.run()

  t.true(tasks['node'].success)
})
