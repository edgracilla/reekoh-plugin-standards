'use strict'

const fs = require('fs')
const chalk = require('chalk')
const yamljs = require('yamljs')

const TARGET_FILE = 'app.yml'

class AppsYml {
  constructor (root, pluginName) {
    this.root = root
    this.pluginName = pluginName
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
      rootContent: yamljs.load(`${this.root}/${TARGET_FILE}`),
      ruleContent: yamljs.load(`${__dirname}/rules/${TARGET_FILE}`)
    }).then(result => {
      let rule = result.ruleContent
      let root = result.rootContent

      if (!root.apps) errBag.push(`'apps' property not defined`)

      if (!Array.isArray(root.apps)) {
        errBag.push(`'apps' property are expected to be type Array`)
      } else {
        if (root.apps[0]) {
          return Promise.each(Object.keys(root.apps[0]), key => {
            if (key === 'name') {
              if (root.apps[0][key] !== this.pluginName) {
                errBag.push(`'apps.name' value should be '${chalk.greenBright(this.pluginName)}' (${root.apps[0][key]})`)
              }
            } else {
              if (root.apps[0][key] !== rule.apps[0][key]) {
                errBag.push(`'apps.${key}' value should be '${chalk.white(rule.apps[0][key])}'`)
              }
            }
          })
        }
      }
    }).then(() => {
      return Promise.each(errBag, (err, i) => {
        errBag[i] = `${chalk.gray(TARGET_FILE)} -- ${err}`
      })
    }).then(() => {
      return errBag
    })
  }
}

module.exports = AppsYml
