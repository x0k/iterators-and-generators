const range = (from, to) => ({
  [Symbol.iterator] () {
    let value = from
    const max = to
    return {
      next: function () {
        if (value < max) {
          return { value: value++, done: false };
        }
        return { value: undefined, done: true };
      }
    }
  }
})

for (const num of range(1, 4)) {
  num // 1, 2, 3
}