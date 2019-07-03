import test from 'ava'
import { ListrTaskWrapper } from 'listr'

import { findPackageManager } from '../../src/finder/manager'
import { managers } from '../../src/data/managers'
import { Context, Engine } from '../../src/typings'
import semver from 'semver'

const fakeCtx: Context = {
  results: {
    engineslist: {
      engine: 'engineslist',
      success: false,
      version: null,
      manager: {
        name: 'npm',
      },
      tasks: [],
    },
  },
  options: {
    debug: false,
    cwd: process.cwd(),
    ignoreLocal: true,
    strict: false,
    silent: true,
  },
}
const fakeTask: ListrTaskWrapper = {
  title: 'string',
  output: 'any',
  report: (e) => e,
  skip: (m) => m,
  run: (c) => c,
}

test('Package manager `npm` validator should return a valid repository', async (t) => {
  const pkgName = 'engineslist'
  const version = semver.parse('0.1.0')
  if (!version) {
    return t.fail('semver.parse returned undefined')
  }

  const repo = await managers['npm'].getRepo(pkgName, version)

  if (repo) {
    t.is(repo.name, pkgName)
  } else {
    t.fail('No repository')
  }
})

test('Package manager `npm` validator should fail', async (t) => {
  const pkgName = 'blablutestxyz'
  const version = semver.parse('0.1.0')
  if (!version) {
    return t.fail('semver.parse returned undefined')
  }

  const repo = await managers['npm'].getRepo(pkgName, version)

  t.false(repo)
})

test('Package manager `npm` getVersions should return a list of available versions', async (t) => {
  const pkgName = 'npm-supervisor' // deprecated repo as example
  const versions = await managers['npm'].getVersions(pkgName)
  const expectedVersions = [
    '0.2.0',
    '0.2.1',
    '0.2.2',
    '0.2.3-test.1',
    '0.2.3',
    '0.2.4',
  ]

  t.deepEqual(versions, expectedVersions)
})

test('Does not find package manager because it is a executable', async (t) => {
  const engine: Engine = {
    cmd: './executable.js',
    range: '>=0.0.1',
  }

  const result = await findPackageManager(fakeCtx, fakeTask, engine)

  t.is(result, 'Executables does not have a package manager')
})

// TODO: find release of engine for package manager
