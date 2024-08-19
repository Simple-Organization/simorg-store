import { Signal } from '..';
import { MultiSelector } from './MultiSelector-class';
import { SingleSelector } from './SingleSelector-class';

//

/** One or more values from `Signal` stores. */
type SignalValue<T> =
  T extends Signal<infer U>
    ? U
    : { [K in keyof T]: T[K] extends Signal<infer U> ? U : never };

//

export function selector<T extends Signal<any>, U>(
  from: T,
  getter: (value: SignalValue<T>) => U,
  is?: typeof Object.is,
): Signal<U>;

//

export function selector<T>(
  getter: (get: <U>(signal: Signal<U>) => U) => T,
  is?: typeof Object.is,
): Signal<T>;

//
//

export function selector(
  arg1: Signal<any> | ((get: <U>(signal: Signal<U>) => U) => any),
  arg2: ((value: any) => any) | typeof Object.is = Object.is,
  arg3?: typeof Object.is,
): Signal<any> {
  if (typeof arg1 === 'function') {
    return new MultiSelector(arg1, arg2 as typeof Object.is);
  }

  return new SingleSelector(arg1, arg2 as (value: any) => any, arg3);
}
