// tslint:disable:no-string-literal

import test from 'ava'
import { Supervisor } from '../src'

test('Not a executable program', async t => {
  const supervisor = new Supervisor({
    engines: {
      'this-must-fail': '>1.2.3',
    },
  })

  const tasks = await supervisor.run()

  t.false(tasks['this-must-fail'].tasks[0].success)
})

test('Not a global program', async t => {
  const supervisor = new Supervisor({
    engines: {
      tslint: '^8.1.0',
    },
  })

  const tasks = await supervisor.run()

  t.false(tasks['tslint'].tasks[0].success)
})

test('Not a valid version', async t => {
  const supervisor = new Supervisor({
    engines: {
      node: 'O.o.p.s',
    },
  })

  const tasks = await supervisor.run()

  t.false(tasks['node'].tasks[2].success)
})

test('Version not in range', async t => {
  const supervisor = new Supervisor({
    engines: {
      node: '<1.0.0',
    },
  })

  const tasks = await supervisor.run()

  t.false(tasks['node'].tasks[3].success)
})

test('Everything is fine', async t => {
  const supervisor = new Supervisor({
    engines: {
      node: '>=10.3.0',
    },
  })

  const tasks = await supervisor.run()

  t.true(tasks['node'].success)
})
