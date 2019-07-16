import { ListrTaskWrapper } from 'listr'
import { Observable } from 'rxjs'
import execa from 'execa'
import chalk from 'chalk'

import { Context, Engine } from '../typings'

const needles = [
  {
    cmd: 'command',
    flags: ['-v'],
  },
  {
    cmd: 'whereis',
  },
  {
    // execute a file with permissions and a valid shebang
    cmd: 'self',
  },
]

export function findProgram(
  ctx: Context,
  task: ListrTaskWrapper,
  engine: Engine,
) {
  return new Observable((observer) => {
    let success = false
    const maxSteps = needles.length
    let step = 0

    needles.forEach(({ cmd, flags = [] }) => {
      if (success) {
        return
      }

      observer.next(`Available through ${chalk.blue(cmd)}?`)
      step++

      try {
        let response
        if (cmd === 'self' && engine.executable) {
          response = execa.sync(engine.executable, {
            preferLocal: false,
          })
        } else {
          const cmdFlags = [...flags, engine.cmd]
          response = execa.sync(cmd, cmdFlags, {
            preferLocal: false,
          })
          // TODO: save executable path in engine
        }
        const { stderr, stdout } = response

        if (ctx.options.debug) {
          console.log('Engine:', chalk.green(engine.cmd))
          console.log('Command:', response.command)
          console.log('Stdout:', stdout)
          console.log('Stderr:', stderr)
          console.log('Steps:', step, maxSteps)
        }

        if (stdout.includes(engine.cmd) || (stdout && !stderr)) {
          success = true
          ctx.results[engine.cmd].tasks.push({
            name: 'findProgram',
            success: true,
            message: `Executable found`,
            data: { stdout, engine, flags },
            task,
          })
          return observer.complete()
        }

        if (step === maxSteps) {
          ctx.results[engine.cmd].tasks.push({
            name: 'findProgram',
            success: false,
            message: `Executable not found`,
            data: { stderr, engine, flags },
            task,
          })
          return observer.error(new Error('Executable not found'))
        }

        observer.next("Failed, let's try another one")
      } catch (error) {
        if (ctx.options.debug) {
          console.log('Engine:', chalk.green(engine.cmd))
          console.log('Command:', engine.executable || engine.cmd)
          console.log('Steps:', step, maxSteps)
          console.log(error.message)
        }

        if (step === maxSteps) {
          ctx.results[engine.cmd].tasks.push({
            name: 'findProgram',
            success: false,
            message: `Executable not found`,
            data: { error, engine, flags },
            task,
          })
          return observer.error(new Error('Executable not found'))
        }

        observer.next("Failed, let's try another one")
      }
    })
  })
}
