import semver, { SemVer } from 'semver'

import { InputEngine } from './typings'

export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise((r) => setTimeout(r, ms))
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function indent(
  str: string,
  lineBreaks: number = 0,
  width: number = 4,
): string {
  return '\n'.repeat(lineBreaks) + str.padStart(width + str.length)
}

export function parseEngines(engines: InputEngine) {
  return Object.entries(engines).map(([cmd, range]) => ({ cmd, range }))
}

export function calculateClosestVersion(versions: string[], range: string) {
  const version = semver.coerce(range) as SemVer
  const versionAsNum = Number(version.version.replace('.', ''))
  const sortedSemvers = semver.sort(versions)
  const min = semver.minSatisfying(sortedSemvers, range) as string
  const minAsNum = Number(min.replace('.', ''))
  const max = semver.maxSatisfying(sortedSemvers, range) as string
  const maxAsNum = Number(max.replace('.', ''))
  if (Math.abs(minAsNum - versionAsNum) < Math.abs(maxAsNum - versionAsNum)) {
    return min
  } else {
    return max
  }
}
