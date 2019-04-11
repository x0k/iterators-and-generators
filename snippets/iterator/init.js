const numbers = [1, 2, 3]
numbers[Symbol.iterator] // function ArrayValues() { [native code] }

var iterator = numbers[Symbol.iterator]();
iterator.next(); // Object {value: 1, done: false}
iterator.next(); // Object {value: 2, done: false}
iterator.next(); // Object {value: 3, done: false}
iterator.next(); // Object {value: undefined, done: true}
iterator.next(); // Object {value: undefined, done: true}

for (const num of numbers) {
  num // 1, 2, 3
}