import { ListrTaskWrapper } from 'listr'

export interface IEngines {
  [key: string]: string
}

export interface IOptions {
  debug?: boolean
  cwd?: string
  engines?: IEngines
  ignoreLocal?: boolean
  silent?: boolean
}

export interface IResult {
  task: ListrTaskWrapper
  success: boolean
  message: string
  data: any
}

export interface IResults {
  [key: string]: {
    success: boolean
    tasks: IResult[]
  }
}

export interface IContext {
  version: string
}
