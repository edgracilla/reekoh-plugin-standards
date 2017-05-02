'use strict'

const globby = require('globby')
const program = require('commander')
const bluebird = require('bluebird')

const runner = require('./runner')
const packageJson = require('./package.json')

const Icon = require('./lib/Icon')
const Repository = require('./lib/Repository')

const IconRunner = require('./runner/IconRunner')

let icon = new Icon()
let repo = new Repository()
let iconRnr = new IconRunner()

global.Promise = bluebird

program
  .version(packageJson.version)
  .option('-r, --root <String>', 'Root dir')
  .option('-f, --fix', 'Fix discrepancies found', false)
  .option('-v, --verbose', 'Verbose logging', true)
  .option('-x, --xxx', 'xxx')
  
// program
// 	.command('icon')
// 	.description('Run reekoh plugin standard checker')
// 	.option('-b, --base <String>', 'Base path to check')
// 	.option('-v, --verbose', 'Verbose logging', true)
//   .action((options) => {
//   	icon.check(options)
//   })

program
	.command('repo-check')
	.description('Repository Check')
	.option('-u, --root-url <String>', 'Root url')
	.option('-b, --base <String>', 'Base path to check')
	.option('-v, --verbose', 'Verbose logging', true)
  .action((options, a) => {
  	repo.check(options, a)
  })

program
	.parse(process.argv)

// 'rkhs' cmd was fired with no params
// --root was filled by bat file
if (program.rawArgs.length > 2) {
	if (program.root) {
		// runner.run(program.root).then(ruleErr => {
		// 	ruleErr.forEach(err => {
		// 		console.log(err)
		// 	})
		// }).catch(err => {
		// 	console.log(err.message)
		// })

		console.log(`-- Checking icons..`, program.verbose)

		iconRnr.run(program.root, program.fix, program.verbose).then(() => {
			console.log(`-- Icon check done!`)
		}).catch(err => {
			console.log(`${err}`)
		})
	}
} else {
	console.log(program.rawArgs.length)
	console.log(program.rawArgs)
}
