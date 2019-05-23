import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import { terser } from 'rollup-plugin-terser'
import createBanner from 'create-banner'
import moment from 'moment'
import pkg from './package.json'

const name = 'NPM Supervisor'
const banner = createBanner({
  data: {
    name,
    date: moment().format('DD.MM.YYYY'),
  },
})

const plugins = [
  typescript({
    useTsconfigDeclarationDir: true,
    tsconfig: 'tsconfig.json',
    tsconfigOverride: {
      compilerOptions: {
        declarationDir: 'dist',
        target: 'es5',
        module: 'es6',
      },
    },
  }),
  json({
    compact: true,
  }),
  terser({
    toplevel: true,
    output: {
      comments: (_, { type, value }) => {
        if (type == 'comment2') {
          return new RegExp('NPM Supervisor').test(value)
        }
      },
    },
  }),
]

export default [
  {
    input: 'src/cli.ts',
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'path',
      'util',
    ],
    output: [
      {
        banner: '#!/usr/bin/env node', // add shebang
        file: `bin/cli.js`,
        format: 'cjs',
      },
    ],
    plugins,
  },
  {
    input: 'src/index.ts',
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      'path',
    ],
    output: [
      {
        banner,
        file: `dist/supervisor.js`,
        format: 'cjs',
      },
      {
        banner,
        file: `dist/supervisor.esm.js`,
        format: 'esm',
      },
    ],
    plugins,
  },
]
