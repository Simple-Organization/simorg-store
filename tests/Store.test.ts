import { test, expect } from '@playwright/test';
import { store } from '../src';

//
//

test.describe('Store', () => {
  //
  //

  test('store must be created and unsubscribed normally', () => {
    const signal = store('hello');

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello', 'world']);
  });

  //
  //

  test('If the same value is given to the store, it must not reupdate', () => {
    const signal = store('hello');

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('world');
    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello', 'world']);
  });

  //
  //

  test('store should reupdate if is return false', () => {
    const signal = store('hello', () => false);

    const values: string[] = [];

    const unsubscribe = signal.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('world');
    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello', 'world', 'world', 'world']);
  });
});
