import { Signal } from '..';

//
//

/** One or more values from `Signal` stores. */
type SignalValue<T> =
  T extends Signal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };

//
//

export function singleSelector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: typeof Object.is = Object.is,
): Signal<U> {
  let value!: any;
  let unsubscribe: (() => void) | undefined;
  let hasValue = false;

  //

  const callbacks = new Set<(value: any) => void>();

  //
  //

  function subscribe(callback: (value: any) => void) {
    if (!hasValue) {
      value = getter(from.value);
      hasValue = true;
    }

    if (!unsubscribe) {
      let firstSubscribe = true;

      unsubscribe = from.subscribe((fromValue) => {
        if (firstSubscribe) {
          return;
        }

        const newValue = getter(fromValue);

        if (is(newValue, value)) {
          return;
        }

        value = newValue;
        callback(value);
      });

      firstSubscribe = false;
    }

    callback(value);
    callbacks.add(callback);
    return () => {
      callbacks.delete(callback);

      if (callbacks.size === 0) {
        unsubscribe!();
        unsubscribe = undefined;
      }
    };
  }

  //
  //

  return {
    get value() {
      if (callbacks.size === 0) {
        return getter(from.value);
      } else if (!hasValue) {
        value = getter(from.value);
        hasValue = true;
      }
      return value;
    },
    subscribe,
    get count() {
      return callbacks.size;
    },
  };
}
