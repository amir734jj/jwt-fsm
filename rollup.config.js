// noinspection JSUnusedGlobalSymbols

import typescript from 'rollup-plugin-typescript2'
import babel from '@rollup/plugin-babel';

export default [
  // ES Modules
  {
    input: 'index.ts',
    output: {
      file: 'dist/index.es.js', format: 'es',
    },
    plugins: [
      typescript(),
      babel({ extensions: ['.ts'], babelHelpers: "runtime", skipPreflightCheck: true }),
    ],
  },
]
