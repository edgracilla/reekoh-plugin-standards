'use strict'

const chalk = require('chalk')
const fs = Promise.promisifyAll(require('fs'))

const TARGET_FILE = '.dockerignore'

class DockerIgnore {
  constructor (root) {
    this.root = root
  }

  read (path) {
    return fs.readFileAsync(path).then(contents => {
      return contents.toString()
        .replace(/^#.*\r\n/gm, '')
        .match(/[^\r\n]+/g)
    })
  }

  check () {
    let errBag = []
    let inRoot = fs.existsSync(`${this.root}/${TARGET_FILE}`)
    let inRule = fs.existsSync(`${__dirname}/rules/${TARGET_FILE}`)

    if (!inRule) {
      return Promise.reject(new Error(`${TARGET_FILE} rule not set!`))
    }

    if (!inRoot) {
      errBag.push(`${TARGET_FILE} file not in plugin root dir`)
      return Promise.resolve(errBag)
    }

    return Promise.props({
      rootContent: this.read(`${this.root}/${TARGET_FILE}`),
      ruleContent: this.read(`${__dirname}/rules/${TARGET_FILE}`)
    }).then(result => {
      if (~result.rootContent.indexOf('node_modules/')) {
        console.log(chalk.yellow(`WARNING: 'node_modules/' found in '${TARGET_FILE}' verify that this plugin has C bindings.`))
      }

      // content in ruleContent must be in rootContent, if there is any
      // value in rootContent that are not in ruleContent it is permitted!

      return Promise.each(result.ruleContent, ruleItem => {
        if (!~result.rootContent.indexOf(ruleItem)) {
          errBag.push(`'${ruleItem}' not defined`)
        }
      }).then(() => {
        return Promise.each(errBag, (err, i) => {
          errBag[i] = `${chalk.gray(TARGET_FILE)} -- ${err}`
        })
      }).then(() => {
        return errBag
      })
    })
  }
}

module.exports = DockerIgnore
