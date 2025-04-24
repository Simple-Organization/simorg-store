import test, { expect } from '@playwright/test';
import { MultiSelector, store } from '../src';

//
//

test.describe('MultiSelector', () => {
  //
  //

  test('multi selector must be created and unsubscribed normally', () => {
    const signal1 = store('hello');
    const signal2 = store(2);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
    );

    expect(signal1.cbs.size).toBe(0);
    expect(signal2.cbs.size).toBe(0);
    expect(_selector.cbs.size).toBe(0);

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    expect(signal1.cbs.size).toBe(1);
    expect(signal2.cbs.size).toBe(1);
    expect(_selector.cbs.size).toBe(1);

    signal1.set('world');
    signal2.set(3);

    unsubscribe();

    expect(signal1.cbs.size).toBe(0);
    expect(signal2.cbs.size).toBe(0);
    expect(_selector.cbs.size).toBe(0);
  });

  //
  //

  test('multi selector must deliver the correct values', () => {
    const signal1 = store('hello');
    const signal2 = store(2);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.set('world');
    signal2.set(3);

    unsubscribe();

    signal1.set('unsubscribed');
    signal2.set('unsubscribed' as any);

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });

  //
  //

  test('If the atom have its value updated, but no one as subscribed to the multi selector, it must keep sync', () => {
    const signal1 = store('hello');
    const signal2 = store(2);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
    );

    expect(_selector.get()).toBe('hello2');

    signal1.set('world');

    expect(_selector.get()).toBe('world2');
  });

  //
  //

  test('If the same value is given to vanilla multi selector factory, it must not reupdate', () => {
    const signal1 = store('hello');
    const signal2 = store(2);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.set('world');
    signal1.set('world');
    signal1.set('world');
    signal2.set(3);
    signal2.set(3);
    signal2.set(3);

    unsubscribe();

    signal1.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });

  //
  //

  test('If the atom reupdate the multi selector should not reupdate', () => {
    const signal1 = store('hello', () => false);
    const signal2 = store(2, () => false);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.set('world');
    signal1.set('world');
    signal1.set('world');
    signal2.set(3);
    signal2.set(3);
    signal2.set(3);

    unsubscribe();

    signal1.set('unsubscribed');

    expect(values).toEqual(['hello2', 'world2', 'world3']);
  });

  //
  //

  test('The multi selector must subscribe lazily', () => {
    const signal1 = store('hello');
    const signal2 = store(2);

    let count = 0;

    const _selector = new MultiSelector((get) => {
      count++;
      return get(signal1) + '' + get(signal2);
    });

    expect(count).toBe(0);

    const unsubscribe = _selector.subscribe(() => {});

    expect(count).toBe(1);

    unsubscribe();
  });

  //
  //

  test('If the atom reupdate the and the selector is set to false it should reupdate', () => {
    const signal1 = store('hello', () => false);
    const signal2 = store(2, () => false);
    const _selector = new MultiSelector(
      (get) => get(signal1) + '' + get(signal2),
      () => false,
    );

    const values: string[] = [];

    const unsubscribe = _selector.subscribe((value) => {
      values.push(value);
    });

    signal1.set('world');
    signal1.set('world');
    signal1.set('world');
    signal2.set(3);
    signal2.set(3);
    signal2.set(3);

    unsubscribe();

    signal1.set('unsubscribed');

    expect(values).toEqual([
      'hello2',
      'world2',
      'world2',
      'world2',
      'world3',
      'world3',
      'world3',
    ]);
  });
});
