import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import esbuild from 'rollup-plugin-esbuild';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/browser.js',
    format: 'iife',
    name: 'MixpanelOpenFeatureProvider',
    globals: {
      '@openfeature/web-sdk': 'OpenFeature'
    },
    sourcemap: true
  },
  external: ['@openfeature/web-sdk'],
  plugins: [
    resolve({
      extensions: ['.ts', '.js']
    }),
    commonjs(),
    esbuild({
      target: 'es2018'
    })
  ]
};
