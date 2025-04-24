import test, { expect } from '@playwright/test';
import { singleSelector, store } from '../src';

//
//

test.describe('singleSelector', () => {

  //
  //

  test('single selector must deliver the correct values', () => {
    const signal = store('hello');
    const _selector = singleSelector(signal, (value) => value + '2');

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('worldee');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2', 'worldee2']);
  });

  //
  //

  test('If the store have its value updated, but no one as subscribed to the multi selector, it must keep sync', () => {
    const signal = store('hello');
    const _selector = singleSelector(signal, (value) => value + '2');

    expect(_selector.get()).toBe('hello2');

    signal.set('world');

    expect(_selector.get()).toBe('world2');
  });

  //
  //

  test('If the same value is given to single selector, it must not reupdate', () => {
    const signal = store('hello');
    const _selector = singleSelector(signal, (value) => value + '2');

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('world');
    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2']);
  });

  //
  //

  test('If the store reupdate the single selector should not reupdate', () => {
    const signal = store('hello', () => false);
    const _selector = singleSelector(signal, (value) => value + '2');

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('world');
    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2']);
  });

  //
  //

  test('The single selector must subscribe lazily', () => {
    const signal = store('hello');

    let count = 0;

    const _selector = singleSelector(signal, (value) => {
      count++;
      return value + '2';
    });

    expect(count).toBe(0);

    const unsubscribe = _selector.subscribe(() => {});

    expect(count).toBe(1);

    unsubscribe();
  });

  //
  //

  test('If the store reupdate the and the selector is set to false it should reupdate', () => {
    const signal = store('hello', () => false);
    const signal2 = store(2, () => false);
    const _selector = singleSelector(
      signal,
      (value) => value + '2',
      () => false,
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal.set('world');
    signal.set('world');
    signal.set('world');

    unsubscribe();

    signal.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2', 'world2', 'world2']);
  });
});
