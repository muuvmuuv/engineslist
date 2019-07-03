import test from 'ava'

import { PlainSyncLoader } from '../src/plain-parser'

test('Cosmiconfig plain sync parser', async (t) => {
  const engines = 'node>=10.15.3'

  const enginesArray = PlainSyncLoader('', engines)
  const expectedArray = { node: '>=10.15.3' }

  t.deepEqual(enginesArray, expectedArray)
})
