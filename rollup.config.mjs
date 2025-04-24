import { dts } from 'rollup-plugin-dts';

//
//

const config = [
  //
  //  Simorg Store
  //

  {
    input: './dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
