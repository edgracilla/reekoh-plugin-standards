'use strict'

global.Promise = require('bluebird')

const Runner = require('./runner')

if (process.argv.length < 3) {
  console.log('Command param err')
} else {
  let runner = new Runner()
  let root = process.argv[2]

  if (runner.validRoot(root)) {
    runner.run(root)
  } else {
    runner.runDeep(root)
  }
}
