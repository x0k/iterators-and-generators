interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
interface Iterator<T> {
  next(): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
}
interface IteratorResult<T> {
  value: T;
  done: boolean;
}

function * range (from, to, step = 1) {
  let value = from
  while (value < to) {
    yield value
    value += step
  }
  return value
}

const items = [...range(1, 6, 2)]
items // [1, 3, 5]