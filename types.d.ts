import { ListrTaskWrapper } from 'listr'
import { SemVer } from 'semver'

declare const Engineslist: {
  new (): Engineslist.Engineslist
  new (engines: Engineslist.InputEngine): Engineslist.Engineslist
  new (options: Engineslist.InputOptions): Engineslist.Engineslist
  new (
    engines: Engineslist.InputEngine,
    options: Engineslist.InputOptions,
  ): Engineslist.Engineslist
}

declare namespace Engineslist {
  interface Engineslist {
    options: Options
    run(): Promise<Context['results']>
  }

  export interface InputEngine {
    [cmd: string]: string
  }

  export interface InputOptions {
    debug?: boolean
    cwd?: string
    ignoreLocal?: boolean
    strict?: boolean
    silent?: boolean
  }

  export interface Engine {
    cmd: string
    range: string
    executable?: string
  }

  export type Engines = Engine[]

  export interface Options {
    debug: boolean
    cwd: string
    ignoreLocal: boolean
    strict: boolean
    silent: boolean
  }

  export interface Result {
    name: string
    task: ListrTaskWrapper
    success: boolean
    message: string
    data: any
  }

  export interface Results {
    [engine: string]: {
      engine: string
      success: boolean
      version: string | null
      manager: {
        name: string | undefined
        repo?: any
      }
      tasks: Result[]
    }
  }

  export interface Context {
    results: Results
    options: Options
  }

  export interface Managers {
    [manager: string]: {
      name: string
      keys: string[]
      exclude: string[]
      getClosestVersion: (e: string, v: string) => Promise<any>
      validator: (e: string, v: SemVer) => Promise<boolean | any>
    }
  }

  export interface StopError {
    name: string
    errors: any[]
    context: Context
  }
}
