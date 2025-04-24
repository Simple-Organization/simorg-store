import { ReadableSignal } from '..';
import { _is, Comparator } from './utils';

//
//

export type SignalValue<T> = T extends ReadableSignal<infer U> ? U : never;

//
//

/**
 * A selector from a single signal. Only subscribes to the signal when there is at least one subscriber.
 */
export function singleSelector<T extends ReadableSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: Comparator = _is,
): ReadableSignal<U> {
  let v: U;
  let unsub: (() => void) | undefined;
  let hasValue = false;
  const cbs = new Set<(value: any) => void>();

  function get(): U {
    if (!unsub) {
      return getter(from.get());
    }
    return v;
  }

  function subscribe(callback: (value: any) => void) {
    if (!hasValue) {
      v = getter(from.get());
      hasValue = true;
    }

    if (!unsub) {
      let firstSubscribe = true;
      unsub = from.subscribe((fromValue) => {
        if (firstSubscribe) {
          firstSubscribe = false;
          return;
        }
        const newValue = getter(fromValue);
        if (is(newValue, v)) {
          return;
        }
        v = newValue;
        for (const cb of cbs) {
          cb(v);
        }
      });
    }

    cbs.add(callback);
    callback(v);

    return () => {
      cbs.delete(callback);
      if (cbs.size === 0 && unsub) {
        unsub();
        unsub = undefined;
      }
    };
  }

  return { get, subscribe };
}
