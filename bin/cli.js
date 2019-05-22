#!/usr/bin/env node

const meow = require('meow')
const Supervisor = require('../dist')

const cli = meow(
  `
    Usage
    $ npm-engineer <directory>

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

const supervisor = new Supervisor({
  silent: false,
  ignoreLocal,
  cwd,
  debug,
})

supervisor.run()
