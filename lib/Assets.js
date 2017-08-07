'use strict'

const fs = require('fs')
const chalk = require('chalk')

class Assets {
  constructor (root, pluginName) {
    this.root = root
    this.pluginName = pluginName
  }

  check () {
    let errBag = []

    if (!fs.existsSync(`${this.root}/assets`)) {
      errBag.push(`'assets' folder not exist`)
    }

    if (!fs.existsSync(`${this.root}/assets/${this.pluginName}.png`)) {
      errBag.push(`'${this.pluginName}.png' icon not exist`)
    }

    return Promise.each(errBag, (err, i) => {
      errBag[i] = `${chalk.gray('./assets')} -- ${err}`
    }).then(() => {
      return errBag
    })
  }

  /* extendable if other assets added */
}

module.exports = Assets
