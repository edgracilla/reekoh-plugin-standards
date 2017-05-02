'use strict'

const conf = require('../config.json')
const utils = require('../misc/utils')

const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const globby = require('globby')

// NOTE: ext must be dynamic, leaving it in png for now

class Icon {
	constructor () {}

	check (pluginRoot) {
		return new Promise((resolve, reject) => {
			let basename = path.basename(pluginRoot)
			resolve(fs.existsSync(`${pluginRoot}/${conf.icon.folder}/${basename}.png`))
		})
	}

	fix (pluginRoot, basename) {
		return globby([
			`${conf.icon.pullSrc}/*/${basename}.png`
		]).then(paths => {
			return new Promise((resolve, reject) => {
				if (!paths.length) return reject(new Error(`Icon pull source '${conf.icon.pullSrc}' does not contain '${basename}.png'`))

				fse.copy(paths[0], `${pluginRoot}/${conf.icon.folder}/${basename}.png`, (err) => {
					console.log(`Copied icon in '${pluginRoot}/${conf.icon.folder}/${basename}.png'`)
					if (err) return reject(err)
					resolve()
				})
			})
		})
	}
}

module.exports = Icon