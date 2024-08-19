import type { OldSignal } from '../../tests/old-selectors/OldSignal';
import { _is } from '../utils';

//
//

export function atom<T>(initial: T, is = _is): OldSignal<T> {
  const callbacks = new Set<(value: T) => void>();
  let value = initial;

  const subscribe = (callback: (value: T) => void) => {
    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);
    };
  };

  return {
    get value() {
      return value;
    },
    set value(newValue) {
      if (is(value, newValue)) {
        return;
      }

      value = newValue;
      for (const callback of callbacks) {
        callback(value);
      }
    },
    subscribe,
    get count() {
      return callbacks.size;
    },
  };
}
