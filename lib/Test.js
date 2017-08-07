'use strict'

const chalk = require('chalk')
const readDir = Promise.promisify(require('fs').readdir)

class Test {
  constructor (root) {
    this.root = root
  }

  check () {
    let errBag = []
    let testCount = 0

    return readDir(`${this.root}/test`).then(contents => {
      return Promise.each(contents, item => {
        if (/\.test\.js/.test(item)) testCount++
      }).then(() => {
        if (!testCount) {
          errBag.push(`Must have atleast 1 test spec`)
        }

        return Promise.each(errBag, (err, i) => {
          errBag[i] = `${chalk.gray('./test')} -- ${err}`
        })
      }).then(() => {
        return errBag
      })
    })
  }
}

module.exports = Test
