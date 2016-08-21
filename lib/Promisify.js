export default function promisify(func) {
  if (func && typeof func.then === 'function') {
    return func
  }

  return function () {
    var args = Array.prototype.slice.apply(arguments)

    return new Promise(function (resolve, reject) {
      func.apply(this, args.concat(function (err, value) {
        if (err) {
          reject(err)
        } else {
          resolve(value)
        }
      }))
    })
  }
}
