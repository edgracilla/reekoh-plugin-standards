'use strict'

const path = require('path')
const async = require('async')

const Icon = require('../lib/Icon')
const utils = require('../misc/utils')

class IconRunner extends Icon {
  run (base, fix = false, verbose = false) {
    return new Promise((resolve, reject) => {
      utils.getPluginRoots(base).then(roots => {        
        if (!roots.length) return reject(new Error(`No plugin roots found in '${base}'`))

        async.each(roots, (root, done) => {
          let parsed = path.parse(root)
          let basename = path.basename(parsed.dir)

          this.check(parsed.dir).then(exist => {
            if (exist) {
              if (utils.isLogVerbose || verbose) {
                console.log(`Icon for plugin '${basename}' found!`)
              }
              return done()
            }

            if (!fix) {
              console.log(`Please check icon for plugin '${basename}'`)
              return done()
            }

            this.fix(parsed.dir, basename)
              .then(done)
              .catch(err => {
                console.log(err.message)
              })
          }).catch(done)
        }, err => {
          if (err) return reject(err)
          resolve()
        })
      }).catch(reject)
    })
  }
}

module.exports = IconRunner
