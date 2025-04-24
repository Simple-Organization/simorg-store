import Benchmark from 'benchmark';
import { atom } from './experiments/atom';
import { Atom } from './old-selectors/class-atom';
import { singleSelector } from './old-selectors/singleSelector';
import { multiSelector } from './old-selectors/multiSelector';
import { atom2 } from './experiments/atom-get';
import { SingleSelector } from './old-selectors/SingleSelector-class';
import { MultiSelector } from './old-selectors/MultiSelector-class';
import { Store } from '../src/stores/Store';

//
// Função para executar o benchmark
async function runBenchmark() {
  let results: { name: string; hz: number; stats: any }[] = [];
  const runAll = false;

  //
  //

  function cycleListener(event: any) {
    console.log(String(event.target));
    results.push({
      name: event.target.name,
      hz: event.target.hz, // Operações por segundo
      stats: event.target.stats, // Estatísticas detalhadas
    });
  }

  //
  //

  function completeListener(resolve: (value: unknown) => void) {
    // Ordenar resultados do mais rápido para o mais lento
    results.sort((a, b) => b.hz - a.hz);

    const fastest = results[0];
    const slowest = results[results.length - 1];
    const factor = fastest.hz / slowest.hz;

    console.log(`Fastest is "${fastest.name}"`);
    console.log(
      `"${fastest.name}" is ${factor.toFixed(2)} times faster than "${slowest.name}"`,
    );

    resolve({ fastest: fastest.name, factor });
  }

  //
  //

  function newSuite(run: boolean, cb: (suite: Benchmark.Suite) => void) {
    if (!run && !runAll) return;

    results = [];
    return new Promise((resolve) => {
      const suite = new Benchmark.Suite()
        .on('cycle', cycleListener)
        .on('complete', () => completeListener(resolve))
        .on('error', (event: any) => console.error(event.target.error));

      cb(suite);
      suite.run({ async: true });
    });
  }

  //
  //

  await newSuite(true, (suite) => {
    console.log('Benchmarking Atom creation\n');

    suite
      // .add('Create Atom using Function', () => {
      //   atom(0);
      // })
      // .add('Create Atom using Function 2', () => {
      //   atom2(0);
      // })
      .add('Create Store', () => {
        new Store(0);
      });
    // .add('Create Atom using Class', () => {
    //   new Atom(0);
    // });
  });

  //
  //

  await newSuite(false, (suite) => {
    console.log('\nBenchmarking Atom subscription\n');

    const signal1 = atom(0);
    const signal2 = new Atom(0);

    suite
      .add('Subscribe Atom using Function', () => {
        const unsub = signal1.subscribe(() => {});
        unsub();
      })
      .add('Subscribe Atom using Class', () => {
        const unsub = signal2.subscribe(() => {});
        unsub();
      });
  });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking Atom value change\n');

  //   const signal1 = atom(0);
  //   const signal2 = new Atom(0);

  //   suite
  //     .add('Change Atom value using Function', () => {
  //       signal1.value = 1;
  //       signal1.value = 2;
  //     })
  //     .add('Change Atom value using Class', () => {
  //       signal2.value = 1;
  //       signal2.value = 2;
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking singleSelector creation\n');

  //   const signal1 = atom(0);
  //   const signal2 = new Atom(0);

  //   suite
  //     .add('Create singleSelector using Function', () => {
  //       singleSelector(signal1, (value) => value);
  //     })
  //     .add('Create singleSelector using Class', () => {
  //       new SingleSelector(signal2, (value) => value);
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking singleSelector creation and subscription\n');

  //   const signal1 = atom(0);
  //   const signal2 = new Atom(0);

  //   suite
  //     .add('Create singleSelector using Function', () => {
  //       const _s = singleSelector(signal1, (value) => value);
  //       const unsub = _s.subscribe(() => {});
  //       unsub();
  //     })
  //     .add('Create singleSelector using Class', () => {
  //       const _s = new SingleSelector(signal2, (value) => value);
  //       const unsub = _s.subscribe(() => {});
  //       unsub();
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking multiSelector creation\n');

  //   const signal1 = atom(0);
  //   const signal2 = atom(0);
  //   const signal3 = new Atom(0);
  //   const signal4 = new Atom(0);

  //   setSignalFactory((initial) => atom(initial));

  //   suite
  //     .on('cycle', () => {
  //       setSignalFactory((initial) => new Atom(initial));
  //     })
  //     .add('Create multiSelector using Function', () => {
  //       multiSelector((get) => get(signal1) + get(signal2));
  //     })
  //     .add('Create multiSelector using Class', () => {
  //       new MultiSelector((get) => get(signal3) + get(signal4));
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking multiSelector value access\n');

  //   setSignalFactory((initial) => atom(initial));
  //   const signal1 = atom(0);
  //   const signal2 = atom(0);
  //   const mult1 = multiSelector((get) => get(signal1) + get(signal2));

  //   setSignalFactory((initial) => new Atom(initial));
  //   const signal3 = new Atom(0);
  //   const signal4 = new Atom(0);
  //   const mult2 = new MultiSelector((get) => get(signal3) + get(signal4));

  //   setSignalFactory((initial) => atom(initial));

  //   suite
  //     .add('Create multiSelector using Function', () => {
  //       mult1.value;
  //     })
  //     .add('Create multiSelector using Class', () => {
  //       mult2.value;
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking multiSelector subscribe\n');

  //   setSignalFactory((initial) => atom(initial));
  //   const signal1 = atom(0);
  //   const signal2 = atom(0);
  //   const mult1 = multiSelector((get) => get(signal1) + get(signal2));

  //   setSignalFactory((initial) => new Atom(initial));
  //   const signal3 = new Atom(0);
  //   const signal4 = new Atom(0);
  //   const mult2 = new MultiSelector((get) => get(signal3) + get(signal4));

  //   setSignalFactory((initial) => atom(initial));

  //   suite
  //     .add('Create multiSelector using Function', () => {
  //       const unsub = mult1.subscribe(() => {});
  //       unsub();
  //     })
  //     .add('Create multiSelector using Class', () => {
  //       const unsub = mult2.subscribe(() => {});
  //       unsub();
  //     });
  // });

  // //
  // //

  // await newSuite(true, (suite) => {
  //   console.log('\nBenchmarking Atom creation vs writable creation\n');

  //   setSignalFactory((initial) => new Atom(initial));

  //   suite
  //     .add('Atom', () => {
  //       signalFactory(0);
  //     })
  //     .add('writable', () => {
  //       writable(0);
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking Atom subscribe vs writable subscribe\n');

  //   setSignalFactory((initial) => new Atom(initial));

  //   const noop = () => {};

  //   suite
  //     .add('Atom', () => {
  //       const unsub = signalFactory(0).subscribe(noop);
  //       unsub();
  //     })
  //     .add('writable', () => {
  //       const unsub = writable(0).subscribe(noop);
  //       unsub();
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking Atom get value vs writable get value\n');

  //   setSignalFactory((initial) => new Atom(initial));

  //   const _w = writable(0);
  //   const _a = signalFactory(0);

  //   suite
  //     .add('Atom', () => {
  //       _a.value;
  //     })
  //     .add('writable', () => {
  //       get(_w);
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log('\nBenchmarking Atom set value vs writable set value\n');

  //   setSignalFactory((initial) => new Atom(initial));

  //   const _w = writable(0);
  //   const _a = signalFactory(0);

  //   suite
  //     .add('Atom', () => {
  //       _a.value = 1;
  //       _a.value = 2;
  //     })
  //     .add('writable.set', () => {
  //       _w.set(1);
  //       _w.set(2);
  //     })
  //     .add('writable.update', () => {
  //       _w.update((prev) => 1);
  //       _w.update((prev) => 2);
  //     });
  // });

  // //
  // //

  // await newSuite(false, (suite) => {
  //   console.log(
  //     '\nBenchmarking Atom set value with subscription vs writable set value with subscription\n',
  //   );

  //   setSignalFactory((initial) => new Atom(initial));

  //   const _w = writable(0);
  //   const _a = signalFactory(0);

  //   const noop = () => {};

  //   _a.subscribe(noop);
  //   _w.subscribe(noop);

  //   suite
  //     .add('Atom', () => {
  //       _a.value = 1;
  //       _a.value = 2;
  //     })
  //     .add('writable.set', () => {
  //       _w.set(1);
  //       _w.set(2);
  //     })
  //     .add('writable.update', () => {
  //       _w.update((prev) => 1);
  //       _w.update((prev) => 2);
  //     });
  // });
}

//
//

runBenchmark();
