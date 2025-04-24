import { WritableSignal } from '..';
import { _is, Comparator } from './utils';

//
//

/**
 * A signal/atom that holds a value and allows subscribing to changes.
 */
export function store<T>(initial: T, is: Comparator = _is): WritableSignal<T> {
  let v = initial;
  const cbs = new Set<(value: T) => void>();
  const comparator = is;

  const set = (newValue: T) => {
    if (comparator(v, newValue)) {
      return;
    }
    v = newValue;
    for (const cb of cbs) {
      cb(v);
    }
  };

  return {
    get(): T {
      return v;
    },
    subscribe(callback: (value: T) => void): () => void {
      callback(v);
      cbs.add(callback);
      return () => {
        cbs.delete(callback);
      };
    },
    set,
  };
}
