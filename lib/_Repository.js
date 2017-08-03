'use strict'
const conf = require('../config.json')

const globby = require('globby')
const async = require('async')
const axios = require('axios')
const path = require('path')

let Spinner = require('cli-spinner').Spinner

class Repository {
  constructor () {
  }

  check (options) {
    if (!options.rootUrl) options.rootUrl = conf.repoCheck.rootUrl

    let spinner = new Spinner('processing.. %s')
    spinner.setSpinnerString('|/-\\')

    globby([
      `${options.base}/package.json`,
      `${options.base}/*/*/package.json`,
      `!${options.base}/node_modules/**`,
    ]).then(paths => {

      let missing = []
      if (!options.verbose) spinner.start()

      async.each(paths, (strPath, done) => {
        let parsed = path.parse(strPath)
        let basename = path.basename(parsed.dir)

        let url = `${options.rootUrl}${basename}`

        this.exist(url).then(() => {
          if (options.verbose) console.log(`Cheking repo '${url}' - OK!`)
          done()
        }).catch(err => {
          if (err) console.log(err)
          missing.push(url)
          done()
        })
      }, err => {
        if (err) return console.log('An error occured.')
        if (!options.verbose) spinner.stop(true)

        if (missing.length) {
          console.log(`\nInaccessible repository (missing or need auth)`)
          console.log(missing)
          console.log(`\nTotal inaccessible: ${missing.length} (missing or private repo)`)
        }
        console.log(`Total repo checked: ${paths.length}`)
      })
    })
  }

  exist (url) {
    return new Promise((resolve, reject) => {
      axios.get(url).then(resp => {
        if (resp.status === 200 && resp.request.res.socket._httpMessage.path !== '/users/sign_in') {
          resolve()
        } else {
          reject(new Error('Repo missing or need auth'))
        }
      }).catch(reject)
    })
  }
}

module.exports = Repository
