import { ListrTaskWrapper } from 'listr'
import { Observable } from 'rxjs'
import execa from 'execa'
import semver from 'semver'
import chalk from 'chalk'

import { Context, Engine } from '../typings'

const needles = ['--version', '-version', '-v']

export function findVersion(
  ctx: Context,
  task: ListrTaskWrapper,
  engine: Engine,
) {
  return new Observable((observer) => {
    let success = false
    const maxSteps = needles.length
    let step = 0

    needles.forEach((flag) => {
      if (success) {
        return
      }
      observer.next(`Available through ${chalk.blue(flag)}?`)
      step++

      try {
        const { stdout, command } = execa.sync(
          engine.executable || engine.cmd,
          [flag],
          {
            preferLocal: false,
          },
        )

        const normalized = semver.coerce(stdout)

        if (ctx.options.debug) {
          console.log('Engine:', chalk.green(engine.cmd))
          console.log('Command:', command)
          console.log('Flag:', flag)
          console.log('Stdout:', stdout)
          console.log('Normalized:', normalized ? normalized.version : null)
        }

        if (normalized) {
          const validVersion = semver.valid(normalized.version)
          if (validVersion) {
            success = true
            ctx.results[engine.cmd].version = validVersion
            ctx.results[engine.cmd].tasks.push({
              name: 'findVersion',
              success: true,
              message: 'Got a valid version',
              data: {
                stdout,
                normalized,
                validVersion,
              },
              task,
            })
            return observer.complete()
          }
        }

        if (step === maxSteps) {
          ctx.results[engine.cmd].tasks.push({
            name: 'findVersion',
            success: false,
            message: `No valid version found`,
            data: { stdout, normalized },
            task,
          })
          return observer.error(new Error('No valid version found'))
        }

        observer.next("Failed, let's try another one")
      } catch (error) {
        if (ctx.options.debug) {
          console.log('Engine:', chalk.green(engine.cmd))
          console.log(error.message)
        }

        if (step === maxSteps) {
          ctx.results[engine.cmd].tasks.push({
            name: 'findVersion',
            success: false,
            message: `Command failed`,
            data: { error, flag },
            task,
          })
          return observer.error(new Error('Command failed'))
        }

        observer.next("Failed, let's try another one")
      }
    })
  })
}
