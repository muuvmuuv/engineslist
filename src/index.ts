import Listr, { ListrTaskWrapper } from 'listr'
import path from 'path'
import chalk from 'chalk'
import execa from 'execa'
import semver from 'semver'
import cosmiconfig from 'cosmiconfig'

import { escapeRegExp, sleep } from './utils'
import { PlainSyncLoader } from './plain-parser'

interface IEngine {
  [type: string]: string
}

export interface IInputOptions {
  debug?: boolean
  cwd?: string
  ignoreLocal?: boolean
  silent?: boolean
  engines?: IEngine
}

export interface IOptions {
  debug: boolean
  cwd: string
  ignoreLocal: boolean
  silent: boolean
  engines: IEngine
}

interface IResult {
  task: ListrTaskWrapper
  success: boolean
  message: string
  data: any
}

interface IResults {
  [key: string]: {
    success: boolean
    tasks: IResult[]
  }
}

interface IContext {
  version: string
}

export class Engineslist {
  private options: IOptions = {
    debug: false,
    cwd: process.cwd(),
    ignoreLocal: true,
    silent: true,
    engines: {},
  }
  private tasks: any
  private results: IResults = {}
  private pillow = 50

  constructor(options?: IInputOptions) {
    const explorer = cosmiconfig('engines', {
      searchPlaces: ['engines', 'engines.yaml', 'package.json'],
      loaders: {
        noExt: {
          sync: PlainSyncLoader,
        },
      },
    })
    const configFromFile = explorer.searchSync()
    if (configFromFile) {
      if (this.options.debug) {
        console.log('Config', chalk.dim(configFromFile.filepath), '\n')
      }
      this.options.engines = configFromFile.config
    }
    this.options = { ...this.options, ...options }

    if (this.options.debug) {
      console.log(this.options)
    }

    this.tasks = new Listr({
      renderer: this.options.debug
        ? 'verbose'
        : this.options.silent
        ? 'silent'
        : 'default',
      concurrent: false,
      exitOnError: false,
    })

    if (this.options.ignoreLocal) {
      this.ignoreLocal()
    }

    this.buildTasks()
  }

  public async run() {
    if (!this.tasks) {
      throw new Error('No tasks found!')
    }

    await this.tasks.run()

    return this.results
  }

  private ignoreLocal() {
    const oldPath = process.env.PATH
    if (oldPath) {
      const pathToBin = path.resolve(this.options.cwd, 'node_modules', '.bin')
      const binRegex = new RegExp(`:?${escapeRegExp(pathToBin)}:?`, 'i')
      const newPath = oldPath.replace(binRegex, ':')
      process.env.PATH = newPath // override $PATH
    }
  }

  private buildTasks() {
    const engines = this.options.engines
    if (!engines) {
      throw new Error('No engines found!')
    }

    Object.keys(engines).forEach(engine => {
      const version = engines[engine]
      this.addTask(engine, version)
    })
  }

  private addTask(engine: string, range: string) {
    this.results[engine] = {
      success: false,
      tasks: [],
    }
    this.tasks.add({
      title: `Checking engine: ${chalk.green(engine)} (${chalk.dim(range)})`,
      task: () => {
        return new Listr(
          [
            {
              title: 'Check availability',
              task: (ctx: IContext, task: ListrTaskWrapper) =>
                this.checkAvailability(ctx, task, engine),
            },
            {
              title: 'Get command version',
              task: (ctx: IContext, task: ListrTaskWrapper) =>
                this.getVersion(ctx, task, engine),
            },
            {
              title: 'Validate range',
              task: (ctx: IContext, task: ListrTaskWrapper) =>
                this.validateVersion(ctx, task, engine, range),
            },
            {
              title: 'Check version against range',
              task: (ctx: IContext, task: ListrTaskWrapper) =>
                this.checkVersion(ctx, task, engine, range),
            },
            {
              title: chalk.dim('Update results'),
              task: () => {
                this.results[engine].success = true
                return Promise.resolve()
              },
            },
          ],
          {
            exitOnError: true,
          }
        )
      },
    })
  }

  private async checkAvailability(
    _: IContext,
    task: ListrTaskWrapper,
    engine: string
  ): Promise<any> {
    try {
      const { stdout } = await execa('command', ['-v', engine], {
        preferLocal: false,
      })

      await sleep(this.pillow) // don't be so shiny

      if (this.options.debug) {
        console.log('Command:', stdout)
      }

      if (stdout.includes(engine)) {
        this.results[engine].tasks.push({
          task,
          success: true,
          message: `Executable found!`,
          data: stdout,
        })
        return Promise.resolve(`Executable found!`)
      }

      this.results[engine].tasks.push({
        task,
        success: false,
        message: `Executable not found!`,
        data: stdout,
      })
      return Promise.reject(new Error(`Executable not found!`))
    } catch (error) {
      if (this.options.debug) {
        console.log(error.message)
      }
      this.results[engine].tasks.push({
        task,
        success: false,
        message: `Error executing program!`,
        data: error,
      })
      return Promise.reject(new Error(`Error executing program!`))
    }
  }

  private async getVersion(
    ctx: IContext,
    task: ListrTaskWrapper,
    engine: string
  ): Promise<any> {
    try {
      const { stdout } = await execa(engine, ['--version'], {
        preferLocal: false,
      })

      await sleep(this.pillow) // don't be so shiny

      const normalized = semver.coerce(stdout)

      if (this.options.debug) {
        console.log('Version:', stdout)
        console.log('Normalized:', normalized ? normalized.version : null)
      }

      if (normalized) {
        const validVersion = semver.valid(normalized.version)
        if (validVersion) {
          ctx.version = validVersion
          this.results[engine].tasks.push({
            task,
            success: true,
            message: 'Got a valid version',
            data: {
              version: stdout,
              normalized,
              validVersion,
            },
          })
          return Promise.resolve()
        }
      }

      this.results[engine].tasks.push({
        task,
        success: false,
        message: `No valid version found! Please fill in an issue on GitHub.`,
        data: { stdout, normalized },
      })
      return Promise.reject(
        new Error(`No valid version found! Please fill in an issue on GitHub.`)
      )
    } catch (error) {
      if (this.options.debug) {
        console.log(error.message)
      }
      this.results[engine].tasks.push({
        task,
        success: false,
        message: `Error fetching version!`,
        data: error,
      })
      return Promise.reject(new Error(`Error fetching version!`))
    }
  }

  private async validateVersion(
    _: IContext,
    task: ListrTaskWrapper,
    engine: string,
    range: string
  ): Promise<any> {
    const valid = await semver.validRange(range)

    await sleep(this.pillow) // don't be so shiny

    if (this.options.debug) {
      console.log('Range:', range)
      console.log('Valid:', valid)
    }

    if (valid) {
      this.results[engine].tasks.push({
        task,
        success: true,
        message: `This version is valid!`,
        data: {
          range,
        },
      })
      return Promise.resolve(`This version is valid!`)
    }

    this.results[engine].tasks.push({
      task,
      success: false,
      message: `This is not a valid version (${range})!`,
      data: {
        range,
      },
    })
    return Promise.reject(new Error(`This is not a valid version (${range})!`))
  }

  private async checkVersion(
    { version }: IContext,
    task: ListrTaskWrapper,
    engine: string,
    range: string
  ): Promise<any> {
    const satisfies = await semver.satisfies(version, range)

    await sleep(this.pillow) // don't be so shiny

    if (this.options.debug) {
      console.log('Version:', version)
      console.log('Range:', range)
      console.log('Satisfies:', satisfies)
    }

    if (satisfies) {
      this.results[engine].tasks.push({
        task,
        success: true,
        message: `Yeah, your program version satisfies the required range!`,
        data: {
          version,
          range,
          satisfies,
        },
      })
      return Promise.resolve(
        `Yeah, your program version satisfies the required range!`
      )
    }

    this.results[engine].tasks.push({
      task,
      success: false,
      message: `Ooh, the required range (${range}) does not satisfies your program version (${version})!`,
      data: {
        version,
        range,
        satisfies,
      },
    })
    return Promise.reject(
      new Error(
        `Ooh, the required range (${range}) does not satisfies your program version (${version})!`
      )
    )
  }
}
