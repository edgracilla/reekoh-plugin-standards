'use strict'

const fs = require('fs')
const chalk = require('chalk')
const yamljs = require('yamljs')

const TARGET_FILE = '.gitlab-ci.yml'

class GitlabCI {
  constructor (root) {
    this.root = root
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
      let root = result.rootContent
      let rule = result.ruleContent

      let rootKeys = Object.keys(root)
      let ruleKeys = Object.keys(rule)

      return Promise.each(ruleKeys, ruleKey => {
        if (!~rootKeys.indexOf(ruleKey)) {
          errBag.push(`'${ruleKey}' not defined`)
        } else {
          if (typeof rule[ruleKey] === 'string') {
            if (rule[ruleKey] !== root[ruleKey]) {
              errBag.push(`value of '${ruleKey}' should be '${chalk.greenBright(rule[ruleKey])}' (${root[ruleKey]})`)
            }
          } else if (Array.isArray(rule[ruleKey])) {
            rule[ruleKey].forEach((item, i) => {
              if (item !== root[ruleKey][i]) {
                errBag.push(`value of '${ruleKey}[${i}]' should be '${chalk.greenBright(item)}' ('${root[ruleKey][i]}')`)
              }
            })
          } else if (typeof rule[ruleKey] === 'object') {
            /* noop for now */
          } else {
            errBag.push(`CRITICAL: '${ruleKey}' type is unknown!`)
          }
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

module.exports = GitlabCI
