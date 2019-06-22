interface IPlain {
  [type: string]: string
}

const PlainSyncLoader = (_: string, content: string) => {
  const returnArray: IPlain = {}
  const matches = content.match(/([a-z-_]+)(.*)/g)
  if (!matches) {
    throw new Error(`We had a problem finding matches in this file`)
  }
  matches.forEach((e, i) => {
    const engine = /([a-z-_]+)(.*)/.exec(e)
    if (!engine) {
      throw new Error(`There was an error in your config file on line: ${i}`)
    }
    const prg = engine[1]
    const version = engine[2].replace(/\s/, '')
    returnArray[prg] = version
  })
  return returnArray
}

export { PlainSyncLoader }
