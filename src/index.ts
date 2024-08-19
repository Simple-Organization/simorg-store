import { Atom } from './atoms/class-atom';

/**
 * Represents a signal/atom that holds a value and allows subscribing to changes.
 */
export type Signal<T = any> = {
  /**
   * The current value of the signal/atom.
   *
   * Depending on the implementation, this value may be mutable.
   */
  value: T;
  /**
   * Subscribes to changes in the signal/atom.
   * @param callback - The function to call when the signal/atom's value changes.
   * @returns A function that unsubscribes the callback from the signal/atom.
   */
  subscribe: (callback: (value: T) => void) => () => void;

  /**
   * The number of subscribers to the signal/atom for tests.
   *
   * May not be present depending on the signal set with `setSignalFactory`.
   */
  count?: number;
};

/**
 * Sets the signalFactory.
 * @param factory - Function that creates a signal with an initial value.
 */
export function setSignalFactory(factory: (initial: any) => Signal): void {
  signalFactory = factory;
}
//
//

export function atom<T>(initial: T, is?: typeof Object.is): Signal<T> {
  return new Atom(initial, is);
}

/**
 * A function that creates a explicit signal
 * @param initial - The initial value of the signal.
 * @returns A signal with the specified initial value.
 * @throws {Error} - If the signal factory is not set.
 */
export let signalFactory: <T>(initial: T, is?: typeof Object.is) => Signal<T> =
  atom;

export { Atom };
export { selector } from './selector/selector';
export { MultiSelector } from './selector/MultiSelector-class';
export { SingleSelector } from './selector/SingleSelector-class';
