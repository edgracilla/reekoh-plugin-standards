'use strict'

const bluebird = require('bluebird')
global.Promise = bluebird

const Test = require('./lib/Test')
const Assets = require('./lib/Assets')
const AppYml = require('./lib/AppYml')
const GitlabCI = require('./lib/GitlabCI')
const ReekohYml = require('./lib/ReekohYml')
const GitIgnore = require('./lib/GitIgnore')
const DockerFile = require('./lib/Dockerffff')
const DockerIgnore = require('./lib/DockerIgnore')

if (process.argv.length < 3) {
  console.log('Command param err')
} else {
  let root = process.argv[2]
  let pluginName = root.match(/.*\\([^\\]+)/)[1]

  let test = new Test(root)
  let gitlabci = new GitlabCI(root)
  let gitignore = new GitIgnore(root)
  let dockerignore = new DockerIgnore(root)

  let assets = new Assets(root, pluginName)
  let appyml = new AppYml(root, pluginName)
  let reekohyml = new ReekohYml(root, pluginName)
  let dockerfile = new DockerFile(root, pluginName)

  // assets.check().then(console.log)
  // test.hasTest().then(console.log)
  // dockerignore.check().then(console.log).catch(console.log)
  // gitignore.check().then(console.log).catch(console.log)
  // gitlabci.check().then(console.log).catch(console.log)
  // dockerfile.check().then(console.log).catch(console.log)
  // appyml.check().then(console.log).catch(console.log)
  reekohyml.check().then(console.log).catch(console.log)
}
