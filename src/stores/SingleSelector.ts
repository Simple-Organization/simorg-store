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
export class SingleSelector<T extends ReadableSignal<any>, U>
  implements ReadableSignal<U>
{
  /**
   * @internal
   */
  v!: any;

  /**
   * @internal
   */
  from: T;

  /**
   * @internal
   */
  getter: (value: SignalValue<T>) => U;

  /**
   * @internal
   */
  unsub: (() => void) | undefined;

  /**
   * @internal
   */
  hasValue = false;

  /**
   * @internal
   */
  cbs = new Set<(value: any) => void>();

  /**
   * @internal
   */
  is: Comparator;

  //
  //

  /**
   * Creates a new single selector.
   * @param from The signal to select from.
   * @param getter Function that processes the value of the signal.
   * @param is The function that compares the current value with the new value.
   */
  constructor(
    from: T,
    getter: (value: SignalValue<T>) => U,
    is: Comparator = _is,
  ) {
    this.from = from;
    this.getter = getter;
    this.is = is;
  }

  /**
   * The current value of the signal/atom.
   * @returns The current value of the signal/atom.
   */
  get(): U {
    if (!this.unsub) {
      return this.getter(this.from.get());
    }
    return this.v;
  }

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe(callback: (value: any) => void) {
    if (!this.hasValue) {
      this.v = this.getter(this.from.get());
      this.hasValue = true;
    }

    if (!this.unsub) {
      let firstSubscribe = true;

      this.unsub = this.from.subscribe((fromValue) => {
        if (firstSubscribe) {
          firstSubscribe = false;
          return;
        }

        const newValue = this.getter(fromValue);

        if (this.is(newValue, this.v)) {
          return;
        }

        this.v = newValue;
        for (const callback of this.cbs) {
          callback(this.v);
        }
      });
    }

    this.cbs.add(callback);
    callback(this.v);

    return () => {
      this.cbs.delete(callback);
      if (this.cbs.size === 0 && this.unsub) {
        this.unsub();
        this.unsub = undefined;
      }
    };
  }
}

//
//

export function singleSelector<T extends ReadableSignal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is: Comparator = _is,
): ReadableSignal<U> {
  return new SingleSelector(from, getter, is);
}
