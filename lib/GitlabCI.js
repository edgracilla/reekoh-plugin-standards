'use strict'

const fs = require('fs')
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
      let rootKeys = Object.keys(result.rootContent)
      let ruleKeys = Object.keys(result.ruleContent)

      return Promise.each(ruleKeys, ruleKey => {
        if (!~rootKeys.indexOf(ruleKey)) {
          errBag.push(`'${ruleKey}' not defined`)
        } else {
          if (typeof result.ruleContent[ruleKey] === 'string') {
            if (result.ruleContent[ruleKey] !== result.rootContent[ruleKey]) {
              errBag.push(`value of '${ruleKey}' shoud be '${result.rootContent[ruleKey]}'`)
            }
          } else if (Array.isArray(result.ruleContent[ruleKey])) {
            result.ruleContent[ruleKey].forEach((item, i) => {
              if (item !== result.rootContent[ruleKey][i]) {
                errBag.push(`value of '${ruleKey}[${i}]' shoud be '${item}'`)
              }
            })
          } else if (typeof result.ruleContent[ruleKey] === 'object') {
            /* noop for now */
          } else {
            errBag.push(`CRITICAL: '${ruleKey}' type is unknown!`)
          }
        }
      }).then(() => {
        return errBag
      })
    })
  }
}

module.exports = GitlabCI
