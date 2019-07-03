import chalk from 'chalk'

interface Plain {
  [type: string]: string
}

const PlainSyncLoader = (_: string, content: string) => {
  const returnArray: Plain = {}
  const lines = content.match(/^.*/gm)
  if (!lines) {
    throw new Error(`It seems like your engines file is empty?`)
  }

  lines.forEach((line, i) => {
    const engine = /^([a-z-_/.]+)(.*)/.exec(line)
    if (!engine) {
      throw new Error(
        'There was an error in your config file on line: ' +
          chalk.yellow(i.toString()) +
          '\n\n' +
          'Please make sure you only specify valid programs no path to a program.\n',
      )
    }
    const prg = engine[1]
    const version = engine[2].replace(/\s/, '')
    returnArray[prg] = version
  })

  return returnArray
}

export { PlainSyncLoader }
