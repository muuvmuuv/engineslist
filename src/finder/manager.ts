import chalk from 'chalk'
import semver from 'semver'

import { Context, Engine } from '../typings'
import { ListrTaskWrapper } from 'listr'
import { calculateClosestVersion } from '../utils'
import { managers } from '../data/managers'

export function findPackageManager(
  ctx: Context,
  task: ListrTaskWrapper,
  engine: Engine,
) {
  return new Promise((resolve) => {
    if (/\.\/[a-z/.]+/i.test(engine.cmd)) {
      // this is a executable file which has no package manager
      return resolve('Executables does not have a package manager')
    }

    const findProgramTask = ctx.results[engine.cmd].tasks.find(
      (t) => t.name === 'findProgram',
    )

    if (ctx.options.debug) {
      console.log('Engine:', chalk.green(engine.cmd))
      console.log('Managers:', managers)
      console.log('findProgramTask: ', findProgramTask)
    }

    if (findProgramTask) {
      const enginePath = findProgramTask.data.stdout

      const pkgManager = Object.values(managers).find(({ keys, exclude }) => {
        const excludeReg = new RegExp(exclude.join('|'))
        const keysReg = new RegExp(keys.join('|'))
        if (excludeReg.test(engine.cmd)) {
          ctx.results[engine.cmd].tasks.push({
            name: 'findPackageManager',
            success: true,
            message: `This engine is excluded`,
            data: { keys, exclude },
            task,
          })
          resolve('This engine is excluded')
          return false
        }
        if (keysReg.test(enginePath)) {
          return true
        }
        return false
      })

      if (ctx.options.debug) {
        console.log(pkgManager)
      }

      if (pkgManager) {
        ctx.results[engine.cmd].manager = { name: pkgManager.name }
        ctx.results[engine.cmd].tasks.push({
          name: 'findPackageManager',
          success: true,
          message: `Program's package manager found`,
          data: { pkgManager },
          task,
        })
        return resolve("Program's package manager is:" + pkgManager.name)
      }
    }

    ctx.results[engine.cmd].tasks.push({
      name: 'findPackageManager',
      success: true,
      message: `No package manager found, skipping`,
      data: {},
      task,
    })
    resolve(`No package manager found, skipping`)
  })
}

export async function findRelease(
  ctx: Context,
  task: ListrTaskWrapper,
  engine: Engine,
) {
  const listVersion = semver.coerce(engine.range)

  if (!listVersion) {
    ctx.results[engine.cmd].tasks.push({
      name: 'findRelease',
      success: false,
      message: `Coerce version went wrong`,
      data: { listVersion, engine },
      task,
    })
    return Promise.reject(new Error('Coerce version went wrong'))
  }

  const engineManager = ctx.results[engine.cmd].manager

  if (!engineManager) {
    ctx.results[engine.cmd].tasks.push({
      name: 'findRelease',
      success: true,
      message: 'No manager found for ' + engine.cmd,
      data: { listVersion, engine, manager: engineManager },
      task,
    })
    return Promise.resolve('No manager found for ' + engine.cmd)
  }

  const manager = managers[engineManager.name]
  const validRepo = await manager.getRepo(engine.cmd, listVersion)

  if (ctx.options.debug) {
    console.log('Engine:', chalk.green(engine.cmd))
    console.log('Manager:', manager)
    console.log('Valid:', validRepo)
  }

  if (validRepo) {
    engineManager.repo = validRepo
    ctx.results[engine.cmd].manager = engineManager
    ctx.results[engine.cmd].tasks.push({
      name: 'findRelease',
      success: true,
      message: 'Found release',
      data: { listVersion, engine, manager: engineManager, validRepo },
      task,
    })
    return Promise.resolve()
  }

  ctx.results[engine.cmd].tasks.push({
    name: 'findRelease',
    success: false,
    message: 'This version does not match any release version',
    data: { listVersion, engine, manger: engineManager, validRepo },
    task,
  })
  return Promise.reject(
    new Error('This version does not match any release version'),
  )
}

export async function getClosestVersion(
  managerName: string,
  engine: string,
  version: string,
) {
  const manager = managers[managerName]
  const versions = await manager.getVersions(engine)

  const closest = calculateClosestVersion(versions, version)

  return closest
}
