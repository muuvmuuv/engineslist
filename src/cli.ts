import meow from 'meow'
import chalk from 'chalk'
import boxen from 'boxen'
import util from 'util'
import { EngineChecker } from '.'

import { version } from '../package.json'

const cli = meow(
  `
    Usage
    $ engine-checker <directory>

    Options
    --ignoreLocal, -i  Ignore local installed node modules (true)

    --debug     Debug program
    --version   Show version
    --help      Show help
`,
  {
    flags: {
      debug: {
        type: 'boolean',
        default: false,
      },
      ignoreLocal: {
        type: 'boolean',
        alias: 'i',
        default: true,
      },
    },
  }
)

const { debug, ignoreLocal } = cli.flags
const cwd = cli.input[0] || process.cwd()

console.log(
  boxen(`${chalk.green('Engine Checker')} (${chalk.dim(version)})`, {
    padding: {
      top: 1,
      bottom: 1,
      right: 8,
      left: 8,
    },
    margin: {
      top: 0,
      bottom: 0,
      right: 3,
      left: 3,
    },
    align: 'center',
    borderColor: 'white',
    dimBorder: true,
  }) + '\n'
)

const checker = new EngineChecker({
  silent: false,
  ignoreLocal,
  cwd,
  debug,
})

checker.run().then(res => {
  const success = Object.values(res).every(v => v.success === true)
  if (!success) {
    console.log(
      `
    ${chalk.red('Oh, no!')}
    Seems like some engines does not satisfies or not
    exists. You may check them and install the correct
    version before using this project.
      `
    )
  } else {
    console.log(
      `
    ${chalk.green('Yeah!')}
    You are ready to go. All engines are compatible
    with you system environment.
      `
    )
  }

  if (debug) {
    console.log()
    Object.keys(res).forEach(r => {
      console.log(chalk.bold(r.toUpperCase()))
      console.log(
        util.inspect(res[r], {
          showHidden: false,
          depth: 3,
          colors: true,
        })
      )
      console.log()
    })
  }
})
