import { ReadableSignal } from '..';
import { _is, Comparator } from './utils';

//
//

/**
 * A selector from multiple signals. Only subscribes to the signals when there is at least one subscriber.
 */
export class MultiSelector<T> implements ReadableSignal<T> {
  /**
   * @internal
   */
  v: any;

  /**
   * @internal
   */
  getter: (get: <U>(signal: ReadableSignal<U>) => U) => T;

  /**
   * @internal
   */
  from: ReadableSignal<any>[] | undefined;

  /**
   * @internal
   */
  values: any[] | undefined;

  /**
   * @internal
   */
  cbs: Set<(value: T) => void> = new Set();

  /**
   * @internal
   */
  unsubs: (() => void)[] | undefined;

  /**
   * @internal
   */
  hasValue = false;

  /**
   * @internal
   */
  is: Comparator;

  //
  //

  /**
   * Creates a new multi selector.
   * @param getter Function that processes the values of the signals.
   * @param is The function that compares the current value with the new value.
   */
  constructor(
    getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
    is: Comparator = _is,
  ) {
    this.getter = getter;
    this.is = is;
  }

  //
  //

  /**
   * The current value of the signal/atom.
   * @returns The current value of the signal/atom.
   */
  get(): T {
    if (!this.hasValue) {
      this._firstGet();
    } else if (this.cbs.size === 0) {
      return this._getValue();
    }
    return this.v;
  }

  /**
   * @internal
   */
  _getValue(): any {
    this.values = [];

    for (const signal of this.from!) {
      this.values.push(signal.get());
    }

    this.v = this.getter((signal) => signal.get());
    return this.v;
  }

  /**
   * @internal
   */
  _firstGet(): any {
    this.from = [];

    const getMethod = (signal: ReadableSignal<any>) => {
      if (!this.from!.includes(signal)) {
        this.from!.push(signal);
      }
      return signal.get();
    };

    const values = [];

    for (const signal of this.from!) {
      values.push(signal.get());
    }

    this.values = values;
    this.v = this.getter(getMethod);
    this.hasValue = true;

    return this.v;
  }

  //
  //

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe(callback: (value: T) => void): () => void {
    if (!this.hasValue) {
      this._firstGet();
    }

    //
    //

    if (!this.unsubs) {
      let firstSubscribe = true;
      this.unsubs = [];

      for (let i = 0; i < this.from!.length; i++) {
        const unsub = this.from![i].subscribe((signalValue) => {
          if (firstSubscribe) {
            return;
          }

          if (this.is(this.values![i], signalValue)) {
            return;
          }

          this.values![i] = signalValue;
          const value = this.getter((signal) => signal.get());
          this.v = value;

          for (const cb of this.cbs) {
            cb(value);
          }
        });

        this.unsubs.push(unsub);
      }

      firstSubscribe = false;
    }

    //
    //

    this.cbs.add(callback);
    callback(this.v);

    //
    //

    return () => {
      this.cbs.delete(callback);
      if (this.cbs.size === 0 && this.unsubs) {
        for (const unsubscribe of this.unsubs) {
          unsubscribe();
        }
        this.unsubs = undefined;
      }
    };
  }
}

//
//

export function multiSelector<T>(
  getter: (get: <U>(signal: ReadableSignal<U>) => U) => T,
  is: Comparator = _is,
): MultiSelector<T> {
  return new MultiSelector(getter, is);
}
