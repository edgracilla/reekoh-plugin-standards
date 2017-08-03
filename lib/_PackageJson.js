'use strict'

const fs = require('fs')
const rule = require('./rules/package_json.json')
const isPlainObject = require('lodash.isplainobject')

const Repository = require('./Repository')

const KEYS_WITH_ANY_VAL = [
  'name', 'version', 'description', 'author', 'url' /* sub */
]

const getKeys = Object.keys
const canAnyVal = key => !!~KEYS_WITH_ANY_VAL.indexOf(key)

let repo = new Repository()

class PackageJson {
  check (path) {
    return new Promise((resolve, reject) => {
      if (!path || !fs.existsSync(path)) {
        return reject(new Error(`Can't find specified file '${path}'`))
      }

      let err = []
      let pkg = require(path)
      let ruleKeys = getKeys(rule)

      ruleKeys.forEach(key => {
        if (!pkg[key]) {
          err.push(`'${key}' is required`)
        } else {
          if (!canAnyVal(key)) { // is this key can contain any val?
            if (!isPlainObject(pkg[key])) {
              if (rule[key] !== pkg[key]) err.push(`'${key}' value must be equal to '${rule[key]}' rcvd '${pkg[key]}'`)
            } else {
              switch (key) {
                case 'scripts':
                case 'repository':
                  getKeys(rule[key]).forEach(skey => {
                    if (!pkg[key][skey]) {
                      err.push(`'${key}.${skey}' is required`)
                    } else {
                      if (canAnyVal(skey)) {
                        if (skey === 'url') {
                          repo.exist(pkg[key][skey]).catch(err => {
                            if (err) console.log(err)
                            console.log(`Url '${pkg[key][skey]}' is inaccessible (missing or need auth)`)
                          })
                        }
                      } else {
                        if (!isPlainObject(pkg[skey])) {
                          if (rule[key][skey] !== pkg[key][skey]) {
                            err.push(`'${key}.${skey}' value must be equal to '${rule[key][skey]}' rcvd '${pkg[key][skey]}'`)
                          }
                        } else {
                          console.log('TO_DEV: 3rd dime not digged!')
                        }
                      }
                    }
                  })
                  break

                case 'dependencies':
                case 'devDependencies':
                  getKeys(rule[key]).forEach(skey => {
                    if (pkg[key][skey] && (rule[key][skey] !== pkg[key][skey])) {
                      console.log(`PkgJson rule states to use version '${rule[key][skey]}' instead of '${pkg[key][skey]}' in '${key}.${skey}' pkg`)
                    }
                  })
                  break

                default:
                  console.log(key, isPlainObject(pkg[key]))
                  break
              }
            }
          }
        }
      })

      resolve(err)
    })
  }

}

module.exports = PackageJson
