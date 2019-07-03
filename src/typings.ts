import { ListrTaskWrapper } from 'listr'
import { SemVer } from 'semver'

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
    manager:
      | {
          name: string
          repo?: any
        }
      | undefined
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
    getVersions: (e: string) => Promise<string[]>
    getRepo: (e: string, v: SemVer) => Promise<boolean | any>
  }
}

export interface ListrError {
  name: string
  errors: any[]
  context: Context
}
