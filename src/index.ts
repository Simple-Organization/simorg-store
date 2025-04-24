/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export type ReadableSignal<T = any> = {
  /**
   * The current value of the signal/atom.
   */
  get: () => T;

  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe: (callback: (value: T) => void) => () => void;
};

/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export interface WritableSignal<T = any> extends ReadableSignal<T> {
  /**
   * Sets the value of the signal/atom.
   */
  set: (value: T) => void;
}

export { multiSelector } from './stores/MultiSelector';
export { singleSelector } from './stores/SingleSelector';
export { store } from './stores/Store';
