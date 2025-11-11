import { afterEach, describe, expect, test, vi } from 'vitest'
import { classNames } from './classNames'

describe('classNames', () => {
  test('Only cls', () => {
    const expected = 'someClass';
    expect(classNames('someClass', {}, [])).toBe(expected);
  });

  test('cls + additional', () => {
    const expected = 'someClass class1 class2';
    expect(classNames('someClass', {}, ['class1', 'class2'])).toBe(expected);
  });

  test('cls + mods', () => {
    const expected = 'someClass modClass';
    expect(classNames('someClass', { modClass: true }, [])).toBe(expected);
  });

  test('cls + mods false', () => {
    const expected = 'someClass';
    expect(classNames('someClass', { modClass: false }, [])).toBe(expected);
  });

  test('cls + mods undefined/null', () => {
    const expected = 'someClass';
    expect(classNames('someClass', { modClass1: undefined, modClass2: null }, [])).toBe(
      expected,
    );
  });

  test('cls + additional + mods', () => {
    const expected = 'someClass class1 class2 modClass';
    expect(classNames('someClass', { modClass: true }, ['class1', 'class2'])).toBe(
      expected,
    );
  });

  test('quantity calling a methods', () => {
    const spyEntries = vi.spyOn(Object, 'entries');
    const spyJoin = vi.spyOn(Array.prototype, 'join');
    const spyFilter = vi.spyOn(Array.prototype, 'filter');
    const spyMap = vi.spyOn(Array.prototype, 'map');

    classNames('someClass', {}, []);
    expect(spyFilter).toHaveBeenCalledTimes(2);
    expect(spyEntries).toHaveBeenCalledTimes(1);
    expect(spyMap).toHaveBeenCalledTimes(1);
    expect(spyJoin).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
})