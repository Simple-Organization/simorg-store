import * as esbuild from 'esbuild';
import { fixClassNamesPlugin } from 'esbuild-utils';

//
//  Signal fatory
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  plugins: [fixClassNamesPlugin()],
});
