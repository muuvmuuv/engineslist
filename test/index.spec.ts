// tslint:disable:no-string-literal

import test from 'ava'
import EngineChecker from '../src'

test('Not a executable program', async t => {
  const engine = new EngineChecker({
    engines: {
      'this-must-fail': '>1.2.3',
    },
  })

  const tasks = await engine.run()

  t.false(tasks['this-must-fail'].tasks[0].success)
})

test('Not a global program', async t => {
  const engine = new EngineChecker({
    engines: {
      tslint: '^8.1.0',
    },
  })

  const tasks = await engine.run()

  t.false(tasks['tslint'].tasks[0].success)
})

test('Not a valid version', async t => {
  const engine = new EngineChecker({
    engines: {
      node: 'O.o.p.s',
    },
  })

  const tasks = await engine.run()

  t.false(tasks['node'].tasks[2].success)
})

test('Version not in range', async t => {
  const engine = new EngineChecker({
    engines: {
      node: '<1.0.0',
    },
  })

  const tasks = await engine.run()

  t.false(tasks['node'].tasks[3].success)
})

test('Everything is fine', async t => {
  const engine = new engine({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await engine.run()

  t.true(tasks['node'].success)
})
