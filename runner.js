'use strict'

const fs = require('fs')
const chalk = require('chalk')

const Test = require('./lib/Test')
const Assets = require('./lib/Assets')
const AppYml = require('./lib/AppYml')
const GitlabCI = require('./lib/GitlabCI')
const ReekohYml = require('./lib/ReekohYml')
const GitIgnore = require('./lib/GitIgnore')
const DockerFile = require('./lib/Dockerffff')
const PackageJson = require('./lib/PackageJson')
const DockerIgnore = require('./lib/DockerIgnore')

class Runner {
  run (root) {
    let pluginName = root.match(/.*\\([^\\]+)/)[1]

    let test = new Test(root)
    let gitlabci = new GitlabCI(root)
    let gitignore = new GitIgnore(root)
    let dockerignore = new DockerIgnore(root)

    let assets = new Assets(root, pluginName)
    let appyml = new AppYml(root, pluginName)
    let reekohyml = new ReekohYml(root, pluginName)
    let dockerfile = new DockerFile(root, pluginName)
    let packagejson = new PackageJson(root, pluginName)

    console.log(chalk.green(`\n### ${pluginName} ###`))

    return Promise.props({
      testErr: test.check(),
      assetsErr: assets.check(),
      giErr: gitignore.check(),
      diErr: dockerignore.check(),
      ciErr: gitlabci.check(),
      ayErr: appyml.check(),
      ryErr: reekohyml.check(),
      dfErr: dockerfile.check(),
      pjErr: packagejson.check()
    }).then(result => {
      let errBag = []
      return Promise.each(Object.keys(result), key => {
        errBag = errBag.concat(result[key])
      }).then(() => {
        if (errBag.length) {
          return Promise.each(errBag, err => {
            console.log(`> ${err}`)
          })
        } else {
          console.log(`> ${chalk.gray('Clean!')}`)
        }
      })
    })
  }

  validRoot (root) {
    return fs.existsSync(`${root}/package.json`)
  }

  runDeep (root) {
    let readDir = Promise.promisify(fs.readdir)

    return readDir(`${root}`).then(contents => {
      return Promise.each(contents, item => {
        let path = `${root}\\${item}`

        if (fs.lstatSync(path).isDirectory()) {
          if (this.validRoot(path)) {
            return this.run(path)
          } else {
            console.log(chalk.yellow(`\nWARNING: '${root}\\${item}' is not a valid plugin directory`))
          }
        }
      })
    })
  }
}

module.exports = Runner
