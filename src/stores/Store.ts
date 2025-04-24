import { WritableSignal } from '..';
import { _is, Comparator } from './utils';

//
//

/**
 * A signal/atom that holds a value and allows subscribing to changes.
 */
export class Store<T> implements WritableSignal<T> {
  /**
   * @internal
   */
  v: T;

  /**
   * @internal
   */
  cbs: Set<(value: T) => void> = new Set();

  /**
   * @internal
   */
  is: Comparator;

  /**
   * Creates a new store.
   * @param initial The initial value of the store.
   * @param is The function that compares the current value with the new value.
   */
  constructor(initial: T, is: Comparator = _is) {
    this.v = initial;
    this.is = is;
  }

  /**
   * The current value of the signal/atom.
   * @returns The current value of the signal/atom.
   */
  get(): T {
    return this.v;
  }

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe(callback: (value: T) => void): () => void {
    callback(this.v);
    this.cbs.add(callback);
    return () => {
      this.cbs.delete(callback);
    };
  }

  /**
   * Sets the value of the signal/atom.
   * @param newValue The new value to set.
   */
  set(newValue: T): void {
    if (this.is(this.v, newValue)) {
      return;
    }

    this.v = newValue;
    for (const callback of this.cbs) {
      callback(this.v);
    }
  }

  /**
   * Updates the value of the signal/atom.
   * @param updater The function that updates the current value.
   */
  update(updater: (value: T) => T): void {
    this.set(updater(this.v));
  }
}

//
//

export function store<T>(initial: T, is: Comparator = _is): Store<T> {
  return new Store(initial, is);
}
