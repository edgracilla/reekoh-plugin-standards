'use strict'

const fs = require('fs')

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
      errBag.push(`'${this.pluginName}' icon not exist`)
    }

    return Promise.resolve(errBag)
  }

  /* extendable if other assets added */
}

module.exports = Assets
