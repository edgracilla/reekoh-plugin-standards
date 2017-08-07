'use strict'

const chalk = require('chalk')
const fs = Promise.promisifyAll(require('fs'))
const TARGET_FILE = 'Dockerfile'

class Dockerfile {
  constructor (root, pluginName) {
    this.root = root
    this.pluginName = pluginName
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
      rootContent: this.readToObject(`${this.root}/${TARGET_FILE}`),
      ruleContent: this.readToObject(`${__dirname}/rules/${TARGET_FILE}`)
    }).then(result => {
      let rule = result.ruleContent
      let root = result.rootContent
      let ruleKeys = Object.keys(rule)

      return Promise.each(ruleKeys, ruleKey => {
        switch (ruleKey) {
          case 'FROM':
            if (!root.FROM) {
              errBag.push(`'FROM' is required`)
            } else if (root.FROM !== rule.FROM) {
              errBag.push(`'FROM' value should be '${chalk.white(rule.FROM)}'`)
            }
            break

          case 'MAINTAINER':
            if (!root.MAINTAINER) {
              errBag.push(`'MAINTAINER' is required`)
            } else if (root.MAINTAINER !== rule.MAINTAINER) {
              errBag.push(`'MAINTAINER' value should be '${chalk.white(rule.MAINTAINER)}'`)
            }
            break

          case 'CMD': // *!
            if (!root.CMD) {
              errBag.push(`'CMD' is required`)
            } else if (root.CMD !== rule.CMD) {
              errBag.push(`'CMD' value should be '${chalk.white(rule.CMD)}'`)
            }
            break

          case 'COPY': // *!
            if (!root.COPY) {
              errBag.push(`'COPY' is required`)
            } else if (this.pluginName !== root.COPY.match(/.*\/([^/]+)/)[1]) {
              let rightValue = rule.COPY.replace('place-holder', this.pluginName)
              errBag.push(`'COPY' value should be '${chalk.greenBright(rightValue)}' ('${root.COPY}')`)
            }
            break

          case 'WORKDIR': // *!
            if (!root.WORKDIR) {
              errBag.push(`'WORKDIR' is required`)
            } else if (this.pluginName !== root.WORKDIR.match(/.*\/([^/]+)/)[1]) {
              let rightValue = rule.WORKDIR.replace('place-holder', this.pluginName)
              errBag.push(`'WORKDIR' value should be '${chalk.greenBright(rightValue)}' ('${root.WORKDIR}')`)
            }
            break

          case 'RUN': // *!!
            if (!root.RUN) {
              errBag.push(`'RUN' is required`)
            } else {
              if (typeof root.RUN === 'string') {
                if (rule.RUN !== root.RUN) {
                  errBag.push(`'RUN' value should be '${chalk.white(rule.RUN)}'`)
                }
              } else if (Array.isArray(root.RUN)) {
                if (~root.RUN.indexOf('npm install') || ~root.RUN.indexOf('npm i')) {
                  errBag.push(`'npm install' should contain '--production' parameter`)
                }
                if (~root.RUN.indexOf('npm install --production') || ~root.RUN.indexOf('npm i --production')) {
                  console.log(chalk.yellow(`WARNING: 'npm install --production' found in '${TARGET_FILE}' verify that this plugin has C bindings.`))
                }
                if (!~root.RUN.indexOf(rule.RUN)) {
                  errBag.push(`'${chalk.white(rule.RUN)}' value should be in you 'RUN' commands `)
                }
                if (root.RUN.length > 2) {
                  errBag.push(`RUN command expects 1 to 2 entries only`)
                }
              }
            }
            break

          // *!
          // can be multiple command, but in current
          // implementation it requires 1 instance only
        }

        if (root.EXPOSE) {
          if (!~['channel', 'gateway', 'stream'].indexOf(this.pluginName.split(/[-]+/).pop())) {
            errBag.push(`EXPOSE command is used in plugin 'channel', 'gateway', and 'stream' only`)
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

  extractLine (line) {
    return Promise.resolve({
      command: line.substr(0, line.indexOf(' ')),
      param: line.substr(line.indexOf(' ') + 1)
    })
  }

  readToObject (path) {
    let result = {}

    return this.read(path).then(content => {
      return Promise.each(content, item => {
        return this.extractLine(item).then(line => {
          if (!result[line.command]) {
            result[line.command] = line.param
          } else { // multi command, convert it to array
            if (typeof result[line.command] === 'string') {
              let oldVal = result[line.command]
              result[line.command] = [oldVal, line.param]
            } else if (Array.isArray(result[line.command])) {
              result[line.command].push(line.param)
            }
          }
        })
      })
    }).then(() => {
      return result
    })
  }
}

module.exports = Dockerfile
