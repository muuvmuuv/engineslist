#!/usr/bin/env node

const flags = process.argv.slice(2)
const validFlag = flags.indexOf('--version') > -1

if (validFlag) {
  process.stdout.write('1.0.0')
} else {
  process.stdout.write('Unknown or no flags:' + flags.join(' '))
}

process.exit(0)
