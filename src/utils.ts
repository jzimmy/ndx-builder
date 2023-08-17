/****
 * utils.ts
 *
 * This is just a collection of some helpful functions that get thrown around
 */

// compile time exhaustiveness assertions
// i.e. in a switch statement default
export function assertNever(_: never): never {
  throw new Error("Unreacheable code encountered! Major bug!");
}

export function insertAtIndex<T>(elem: T, arr: T[], index: number) {
  return index < 0
    ? [...arr, elem]
    : [...arr.slice(0, index), elem, ...arr.slice(index)];
}

export function removeElem<T>(arr: T[], elem: T) {
  let index = arr.indexOf(elem);
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
