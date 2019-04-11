function * range (from, to) {
  let value = from
  while (value < to) {
    const step = yield value
    value += step
  }
  return value
}

const iterator = range(1, 10)
let item = iterator.next()

while (!item.done) {
  console.log(item.value) // 1, 2, 4, 8
  item = iterator.next(item.value)
}
item // { value: 16, done: true }

function * idGenerator (from = 0) {
  while (true) {
    yield from++
  }
}

export const gen = idGenerator()