import Listr, { ListrTaskWrapper } from 'listr'
import path from 'path'
import chalk from 'chalk'
import semver from 'semver'
import is from '@sindresorhus/is'
import pathKey from 'path-key'
import npmRunPath from 'npm-run-path'
import cosmiconfig from 'cosmiconfig'

import {
  Options,
  InputOptions,
  Context,
  ListrError,
  Engine,
  InputEngine,
  Engines,
} from './typings'
import { indent, parseEngines } from './utils'
import { PlainSyncLoader } from './plain-parser'
import { findProgram } from './finder/program'
import { findVersion } from './finder/version'
import {
  findPackageManager,
  findRelease,
  getClosestVersion,
} from './finder/manager'

export class Engineslist {
  public options: Options = {
    debug: false,
    cwd: process.cwd(),
    ignoreLocal: true,
    strict: false,
    silent: true,
  }
  public engines: Engines = []

  private tasks: Listr

  constructor(engines?: InputEngine, options?: InputOptions) {
    this.options = { ...this.options, ...options }

    if (engines && Object.keys(engines).length !== 0) {
      this.engines = parseEngines(engines)
    } else {
      const explorer = cosmiconfig('engines', {
        cache: !this.options.debug,
        searchPlaces: [
          'engineslist',
          'engines',
          'engineslist.yaml',
          'engines.yaml',
          'package.json',
        ],
        loaders: {
          noExt: {
            sync: PlainSyncLoader,
          },
        },
      })
      const configFromFile = explorer.searchSync(this.options.cwd)
      if (configFromFile) {
        if (this.options.debug) {
          console.log('Cosmiconfig:', configFromFile)
        }
        this.engines = parseEngines(configFromFile.config)
      }
    }

    if (this.options.debug) {
      console.log('Options:', this.options)
      console.log('Engines:', this.engines)
    }

    if (this.engines.length === 0) {
      throw new Error('No engines found!')
    }

    this.tasks = new Listr({
      renderer: this.options.debug
        ? 'verbose'
        : this.options.silent
        ? 'silent'
        : 'default',
      concurrent: true,
      exitOnError: false,
    })

    if (this.options.ignoreLocal) {
      this.ignoreLocal()
    }

    this.buildTasks()
  }

  public run(): Promise<Context['results']> {
    if (!this.tasks) {
      throw new Error('No tasks found!')
    }

    return new Promise((resolve) => {
      this.tasks
        .run({
          options: this.options,
          results: [],
        })
        .then((ctx: Context) => {
          if (this.options.debug) {
            console.log('Options:', ctx.options)
          }

          resolve(ctx.results)
        })
        .catch((err: ListrError) => {
          this.displayErrors(err)

          resolve(err.context.results)
        })
    })
  }

  private buildTasks() {
    const engines = this.engines
    if (!engines) {
      throw new Error('No engines found!')
    }

    engines.forEach((engine, index) => {
      // if the cmd is a executable file resolve it's file path
      if (/\.\/[a-z/.]+/i.test(engine.cmd)) {
        engine.executable = this.engines[index].executable = path.resolve(
          this.options.cwd,
          engine.cmd,
        )
      }
      this.addTask(engine)
    })
  }

  private addTask(engine: Engine) {
    this.tasks.add({
      title: `Checking engine: ${chalk.green(engine.cmd)} (${chalk.dim(
        engine.range,
      )})`,
      task: (masterCtx: Context) => {
        masterCtx.results[engine.cmd] = {
          engine: engine.cmd,
          success: false,
          version: null,
          manager: undefined,
          tasks: [],
        }

        return new Listr(
          [
            {
              title: 'Find program',
              task: (ctx, task) => findProgram(ctx, task, engine),
            },
            {
              title: 'Get command version',
              task: (ctx, task) => findVersion(ctx, task, engine),
            },
            {
              title: 'Validate version range',
              task: (ctx, task) => this.validateVersion(ctx, task, engine),
            },
            {
              title: 'Find package manager',
              task: (ctx, task) => findPackageManager(ctx, task, engine),
            },
            {
              title: 'Validate against releases',
              skip: () => !this.options.strict,
              task: (ctx, task) => findRelease(ctx, task, engine),
            },
            {
              title: 'Check version against range',
              task: (ctx, task) => this.checkVersion(ctx, task, engine),
            },
            {
              title: chalk.dim('Update results'),
              task: (ctx) => {
                ctx.results[engine.cmd].success = true
                return Promise.resolve()
              },
            },
          ],
          {
            exitOnError: true,
          },
        )
      },
    })
  }

  private ignoreLocal() {
    const key = pathKey()
    const oldPath = process.env[key] || ''
    let newPath = ''

    const npmPathArray = npmRunPath({
      cwd: path.resolve(__dirname, this.options.cwd),
      path: '',
    })
      .split(':')
      .filter((v) => !is.emptyString(v) && !v.includes('nvm'))

    oldPath.split(':').forEach((p) => {
      const isNotNpmLocal = npmPathArray.indexOf(p) === -1

      if (isNotNpmLocal) {
        newPath += p + ':'
      }
    })

    newPath = newPath.slice(0, -1) // remove last `:`

    if (this.options.debug) {
      console.log()
      console.log(chalk.bold('PATH'))
      console.log('npm:\n', npmPathArray)
      console.log('old:\n- ', oldPath.split(':').join('\n- '))
      console.log('new:\n- ', newPath.split(':').join('\n- '))
      console.log()
    }

    process.env[key] = newPath // override $PATH
  }

  private displayErrors(err: ListrError) {
    if (this.options.debug) {
      console.log(err)
      console.log(err.context.results)
    }

    Object.values(err.context.results).forEach(async (r) => {
      if (r.success) {
        return // this engine is ok
      }
      let log = indent(chalk.bold.underline(r.engine), 1) + '\n'

      for await (const t of r.tasks) {
        if (t.success) {
          continue // this task is ok
        }

        if (this.options.debug) {
          log += indent(chalk.dim(t.name), 1)
        }
        log += indent(chalk.red(t.message), 1)

        if (r.manager) {
          const closest = await getClosestVersion(
            r.manager.name,
            r.engine,
            t.data.engine.range,
          )
          if (closest) {
            log += indent(
              'Try to install the minimum required version with:',
              2,
            )
            // prettier-ignore
            log += indent(`${chalk.yellow(`npm install ${r.engine}@${closest}`)}${chalk.dim(' --save-dev')}`, 1)
          } else {
            log += indent(
              "We tried to find this version on npmjs.org but couldn't find any. Please try again with another version or a more specific range.",
              2,
            )
            log += indent(
              `You may want to have a look in the versions section on ${chalk.underline(
                `https://www.npmjs.com/package/${r.engine}`,
              )}.`,
              1,
            )
          }
        }
      }

      if (!this.options.silent) {
        console.log(log)
      }
    })
  }

  private async validateVersion(
    ctx: Context,
    task: ListrTaskWrapper,
    engine: Engine,
  ): Promise<any> {
    const valid = await semver.validRange(engine.range)

    if (this.options.debug) {
      console.log('Engine:', chalk.green(engine.cmd))
      console.log('Range:', engine.range)
      console.log('Valid:', valid)
    }

    if (valid) {
      ctx.results[engine.cmd].tasks.push({
        name: 'validateVersion',
        success: true,
        message: `Valid version range`,
        data: {
          engine,
        },
        task,
      })
      return Promise.resolve(`Valid version range.`)
    }

    ctx.results[engine.cmd].tasks.push({
      name: 'validateVersion',
      success: false,
      message: `Invalid version range: ${engine.range}`,
      data: {
        engine,
      },
      task,
    })
    return Promise.reject(new Error(`Invalid version range: ${engine.range}`))
  }

  private async checkVersion(
    ctx: Context,
    task: ListrTaskWrapper,
    engine: Engine,
  ): Promise<any> {
    const version = ctx.results[engine.cmd].version
    if (!version) {
      return Promise.reject('No version found')
    }
    const satisfies = await semver.satisfies(version, engine.range)

    if (this.options.debug) {
      console.log('Engine:', chalk.green(engine.cmd))
      console.log('Version:', version)
      console.log('Range:', engine.range)
      console.log('Satisfies:', satisfies)
    }

    if (satisfies) {
      ctx.results[engine.cmd].tasks.push({
        name: 'checkVersion',
        success: true,
        message: `Yeah, your program version satisfies the required range!`,
        data: {
          version,
          engine,
          satisfies,
        },
        task,
      })
      return Promise.resolve(
        `Yeah, your program version satisfies the required range!`,
      )
    }

    ctx.results[engine.cmd].tasks.push({
      name: 'checkVersion',
      success: false,
      message: `Ooh, the required range (${engine.range}) does not satisfies your program version (${version})!`,
      data: {
        version,
        engine,
        satisfies,
      },
      task,
    })
    return Promise.reject(
      new Error(
        `Ooh, the required range (${engine.range}) does not satisfies your program version (${version})!`,
      ),
    )
  }
}
