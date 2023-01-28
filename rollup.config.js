import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import css from "rollup-plugin-css-only";

export default {
  input: 'src/main.ts',
  output: [{
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  {
    dir: './test/.obsidian/plugins/chesser-obsidian',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  }],
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    css({output: [ 'styles.css', './test/.obsidian/plugins/chesser-obsidian/styles.css']}),
  ]
};
