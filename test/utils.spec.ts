import test from 'ava'

import {
  parseEngines,
  sleep,
  indent,
  escapeRegExp,
  calculateClosestVersion,
} from '../src/utils'

test('Should convert a plain engines array into an engines typed object', async (t) => {
  const input = { node: '>=10.15.3' }
  const expection = [{ cmd: 'node', range: '>=10.15.3' }]
  const result = parseEngines(input)

  t.deepEqual(result, expection)
})

test('Should sleep for 400ms', async (t) => {
  const now = new Date().getTime()
  await sleep(400)
  const then = new Date().getTime()

  const diff = then - now
  const between = diff > 400 && diff < 410

  t.true(between)
})

test('Should indent a string by width', async (t) => {
  const input = `Test`
  const expection = `    Test`
  const result = indent(input, 0, 4)

  t.is(result, expection)
})

test('Should escape an URL to a regex valid string', async (t) => {
  const input = `/This/is/A/test.ext`
  const expection = `/This/is/A/test\\.ext`
  const result = escapeRegExp(input)

  t.is(result, expection)
})

test('Should calculate the closest version', async (t) => {
  const versions = ['3.4.0', '1.5.6']
  const range = '<=2.2.0'
  const result = calculateClosestVersion(versions, range)
  const expected = '1.5.6'

  t.is(result, expected)
})
