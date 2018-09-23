const promiseBreaker = function () {
  let resolve, reject
  let promise = new Promise((s, j) => { // eslint-disable-line
    resolve = s
    reject = j
    setTimeout(reject, 15 * 1000, 'pending time up')
  });
  return Object.assign(promise, {resolve, reject})
}

export {
  promiseBreaker
}
