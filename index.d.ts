import { ListrTaskWrapper } from 'listr'

interface Engines {
  [key: string]: string
}

interface Options {
  debug?: boolean
  cwd?: string
  engines?: Engines
  ignoreLocal?: boolean
  silent?: boolean
}

interface Result {
  task: ListrTaskWrapper
  success: boolean
  message: string
  data: any
}

interface Results {
  [key: string]: {
    success: boolean
    tasks: Result[]
  }
}

declare class Supervisor {
  constructor(options?: Options)
  run(): Promise<Results>
}
