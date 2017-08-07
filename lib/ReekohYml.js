const fs = require('fs')
const chalk = require('chalk')
const yamljs = require('yamljs')

const TARGET_FILE = 'reekoh.yml'

class ReekohYml {
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

      return Promise.each(Object.keys(rule), ruleKey => {
        if (ruleKey === 'metadata') {
          return Promise.each(Object.keys(rule[ruleKey]), metaKey => {
            if (!root[ruleKey][metaKey] && metaKey !== 'price') {
              errBag.push(`'metadata.${metaKey}' value is required`)
            }

            if (metaKey === 'release') {
              return Promise.each(Object.keys(rule[ruleKey][metaKey]), releaseKey => {
                if (!root[ruleKey][metaKey][releaseKey]) {
                  errBag.push(`'metadata.release.${releaseKey}' value is required`)
                }
              })
            }
          })
        } else {
          if (!root[ruleKey]) { /* BUG_FIX: version vs apiVersion support */
            errBag.push(`'${ruleKey}' is not defined in root '${TARGET_FILE}'`)
          } else {
            if (rule[ruleKey] !== root[ruleKey]) {
              console.log(rule[ruleKey], root[ruleKey], rule[ruleKey] !== root[ruleKey])
              errBag.push(`'${ruleKey}' value shoud be '${rule[ruleKey]}'`)
            }
          }
        }
      }).then(() => {
        return Promise.each(Object.keys(root.metadata), metaKey => {
          switch (metaKey) {
            case 'icon':
              this.anchoredFileCheck(errBag, metaKey, root.metadata[metaKey], 'assets')
              break

            case 'type':
            case 'consumerType':
              if (!/^[A-Z]/.test(root.metadata[metaKey])) {
                errBag.push(`First letter of '${metaKey}' value must be in Upper case`)
              }
              break

            case 'release':
              return Promise.each(Object.keys(root.metadata.release), releaseKey => {
                if (~['documentation', 'notes'].indexOf(releaseKey)) {
                  let folder = releaseKey === 'notes' ? 'release-notes' : ''
                  this.anchoredFileCheck(errBag, releaseKey, root.metadata[metaKey][releaseKey], folder)
                }
              })
          }
        })

        // * optional in reekoh.yml
      })
    }).then(() => {
      return Promise.each(errBag, (err, i) => {
        errBag[i] = `${chalk.gray(TARGET_FILE)} -- ${err}`
      })
    }).then(() => {
      return errBag
    })
  }

  anchoredFileCheck (errBag, key, value, folder) {
    let ext = key === 'icon' ? 'png' : 'md'

    if (folder) {
      let regexCorrectFolder = new RegExp(`\\.\\/${folder}\\/`)
      let regexCorrectPath = new RegExp(`\\.\\/${folder}\\/${this.pluginName}\\.`)

      if (!regexCorrectFolder.test(value)) {
        errBag.push(`'${key}' folder value should be '${chalk.white(folder)}'`)
      }
      if (key === 'icon') {
        if (!regexCorrectPath.test(value)) {
          let correctPath = `./${folder}/${this.pluginName}.${ext}`
          errBag.push(`'${key}' value should be '${chalk.white(correctPath)}'`)
        }
      }
    }

    if (!fs.existsSync(value.replace(/^\./, `${this.root}`))) {
      errBag.push(`cant find ${key} '${value}'`)
    }
  }
}

module.exports = ReekohYml
