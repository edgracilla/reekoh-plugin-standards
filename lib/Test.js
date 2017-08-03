'use strict'

const readDir = Promise.promisify(require('fs').readdir)

class Test {
  constructor (root) {
    this.root = root
  }

  hasTest () {
    let testCount = 0

    return readDir(`${this.root}/test`).then(contents => {
      return Promise.each(contents, item => {
        if (/\.test\.js/.test(item)) testCount++
      }).then(() => {
        return !!testCount
      })
    })
  }
}

module.exports = Test
