'use strict'

const globby = require('globby')
const conf = require('../config.json')

module.exports.getPluginRoots = (base) => {
  return globby([
    `${base}/package.json`,
    `${base}/*/*/package.json`,
    `!${base}/node_modules/**`,
    `!${base}/.idea/**`
  ])
}

module.exports.isLogVerbose = conf.logging === 'verbose'
