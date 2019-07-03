import test from 'ava'

import { Engineslist } from '../src'

test('Not a executable program', async (t) => {
  const engineslist = new Engineslist({
    'this-must-fail': '=1.2.3',
  })

  const tasks = await engineslist.run()

  const findProgram = tasks[engineslist.engines[0].cmd].tasks.find(
    (task) => task.name === 'findProgram',
  )

  if (findProgram) {
    t.false(findProgram.success)
  } else {
    t.fail()
  }
})

// test('Program version not found', async (t) => {
//   const engineslist = new Engineslist({
//     './faker/version.js': '=1.2.3',
//   })

//   const tasks = await engineslist.run()

//   console.log(tasks[engineslist.engines[0].cmd].tasks)

//   const findProgram = tasks[engineslist.engines[0].cmd].tasks.find(
//     (task) => task.name === 'findProgram',
//   )

//   if (findProgram) {
//     t.false(findProgram.success)
//   } else {
//     t.fail()
//   }
// })

// test('Not a valid version', async t => {
//   const engineslist = new Engineslist({
//     engines: {
//       node: 'O.o.p.s',
//     },
//   })

//   const tasks = await engineslist.run()

//   t.false(tasks['node'].tasks[2].success)
// })

// test('Version not in range', async t => {
//   const engineslist = new Engineslist({
//     engines: {
//       node: '<1.0.0',
//     },
//   })

//   const tasks = await engineslist.run()

//   t.false(tasks['node'].tasks[3].success)
// })

// test('Everything is fine', async t => {
//   const engineslist = new Engineslist({
//     engines: {
//       node: '>=10.3.0',
//     },
//   })

//   const tasks = await engineslist.run()

//   t.true(tasks['node'].success)
// })
