export function sleep(ms: number): Promise<NodeJS.Timeout> {
  return new Promise(r => setTimeout(r, ms))
}

export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
