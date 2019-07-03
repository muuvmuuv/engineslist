import semver from 'semver'

// tslint:disable-next-line:no-var-requires
const NpmApi = require('npm-api')
const npm = new NpmApi()

import { Managers } from '../typings'

export const managers: Managers = {
  npm: {
    name: 'npm',
    keys: ['nvm', 'node_modules', 'node'],
    exclude: ['node'],
    getVersions: async (engine) => {
      const instance = await npm.repo(engine)
      const packages = await instance.package('all')
      const versions = Object.keys(packages.versions)
      return semver.sort(versions)
    },
    getRepo: async (engine, { version }) => {
      try {
        const instance = await npm.repo(engine)
        const repo = await instance.version(version)
        if (Object.entries(repo).length !== 0) {
          return repo
        }
        return false
      } catch (error) {
        return false
      }
    },
  },
}
