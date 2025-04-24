import { ReadableSignal } from '..';
import { _is, Comparator } from './utils';

//
//

/**
 * A selector from multiple signals. Only subscribes to the signals when there is at least one subscriber.
 */
export function multiSelector<T>(
  getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
  is: Comparator = _is,
): ReadableSignal<T> {
  // Internal state
  let v: any;
  let from: ReadableSignal<any>[] | undefined;
  let values: any[] | undefined;
  let cbs: Set<(value: T) => void> = new Set();
  let unsubs: (() => void)[] | undefined;
  let hasValue = false;

  // Helper to get current value from all dependencies
  function _getValue(): any {
    values = [];
    for (const signal of from!) {
      values.push(signal.get());
    }
    v = getter((signal) => signal.get());
    return v;
  }

  // Helper for first get, tracks dependencies
  function _firstGet(): any {
    from = [];
    const getMethod = (signal: ReadableSignal<any>) => {
      if (!from!.includes(signal)) {
        from!.push(signal);
      }
      return signal.get();
    };
    const vals = [];
    for (const signal of from!) {
      vals.push(signal.get());
    }
    values = vals;
    v = getter(getMethod);
    hasValue = true;
    return v;
  }

  // The returned ReadableSignal object
  return {
    get(): T {
      if (!hasValue) {
        _firstGet();
      } else if (cbs.size === 0) {
        return _getValue();
      }
      return v;
    },

    subscribe(callback: (value: T) => void): () => void {
      if (!hasValue) {
        _firstGet();
      }

      if (!unsubs) {
        let firstSubscribe = true;
        unsubs = [];
        for (let i = 0; i < from!.length; i++) {
          const unsub = from![i].subscribe((signalValue) => {
            if (firstSubscribe) return;
            if (is(values![i], signalValue)) return;
            values![i] = signalValue;
            const value = getter((signal) => signal.get());
            v = value;
            for (const cb of cbs) {
              cb(value);
            }
          });
          unsubs.push(unsub);
        }
        firstSubscribe = false;
      }

      cbs.add(callback);
      callback(v);

      return () => {
        cbs.delete(callback);
        if (cbs.size === 0 && unsubs) {
          for (const unsubscribe of unsubs) {
            unsubscribe();
          }
          unsubs = undefined;
        }
      };
    }
  };
}
