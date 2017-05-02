'use strict'

const globby = require('globby')
const PackageJson = require('./lib/PackageJson')

let pkgJson = new PackageJson()

exports.run = (basePath) => {	// buggy!!
	return new Promise((resolve, reject) => {
		globby([
			`${basePath}/package.json`,
			// `${basePath}/package.json`,
			// `${basePath}/*/*/package.json`,
			// `!${basePath}/node_modules/**`,
		]).then(paths => {
			if (!paths.length) 
				reject(new Error(`package.json file not found in '${basePath}'!`))

			pkgJson.check(paths[0])
				.then(resolve)
				.catch(reject)
		})
	})
}