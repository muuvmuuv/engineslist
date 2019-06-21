import { ListrTaskWrapper } from 'listr'

interface IEngine {
  [name: string]: string
}

export interface IInputOptions {
  debug?: boolean
  cwd?: string
  ignoreLocal?: boolean
  silent?: boolean
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

export declare class Engineslist {
  constructor(options?: IInputOptions)
  run(): Promise<IResults>
}

export {}
