'use strict'

const fs = require('fs')
const chalk = require('chalk')
const TARGET_FILE = 'package.json'

class PackageJson {
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
      rootContent: require(`${this.root}/${TARGET_FILE}`),
      ruleContent: require(`${__dirname}/rules/${TARGET_FILE}`)
    }).then(result => {
      let rule = result.ruleContent
      let root = result.rootContent

      return Promise.each(Object.keys(rule), ruleKey => {
        if (!root[ruleKey]) errBag.push(`'${ruleKey}' is required`)
      }).then(() => {
        return Promise.each(Object.keys(root), rootKey => {
          switch (rootKey) {
            case 'name':
              if (root.name !== this.pluginName) {
                errBag.push(`'${rootKey}' value should be '${chalk.greenBright(this.pluginName)}' (${root.name})`)
              }
              break

            case 'main':
            case 'author':
            case 'license':
              if (rule[rootKey] !== root[rootKey]) {
                errBag.push(`'${rootKey}' value should be '${chalk.greenBright(rule[rootKey])}' (${root[rootKey]})`)
              }
              break

            case 'repository':
              if (!root.repository.url) {
                errBag.push(`'repository.url' is required`)
              } else {
                let urls = [
                  `https://gitlab.com/reekoh/${this.pluginName}`,
                  `https://gitlab.com/barhead/${this.pluginName}`,
                  `https://gitlab.com/cloud-motors/${this.pluginName}`
                ]

                if (!~urls.indexOf(root.repository.url)) {
                  errBag.push(`'repository.url' invalid value (${root.repository.url})`)
                }
              }
              break
          }
        })
      }).then(() => {
        let ruleMods = {}
        let rootMods = {}

        if (rule.dependencies || rule.devDependencies) ruleMods = Object.assign(rule.dependencies, rule.devDependencies)
        if (root.dependencies || root.devDependencies) rootMods = Object.assign(root.dependencies, root.devDependencies)

        return Promise.each(Object.keys(rootMods), module => {
          if (/^\^/.test(rootMods[module])) {
            errBag.push(`module must be on exact version "${module}":"${rootMods[module]}"`)
          } else {
            if (ruleMods[module] && ruleMods[module] !== rootMods[module]) {
              errBag.push(`'${module}' version should be '${chalk.greenBright(ruleMods[module])}' (${rootMods[module]})`)
            }
          }
        })
      })
    }).then(() => {
      return Promise.each(errBag, (err, i) => {
        errBag[i] = `${chalk.gray(TARGET_FILE)} -- ${err}`
      })
    }).then(() => {
      return errBag
    })
  }
}

module.exports = PackageJson
