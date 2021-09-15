const fs = require('fs')
const path = require('path')
const _ = require('lodash')

const MODULE_REGEX = /^(\d{2,3})-([a-zA-Z0-9-]*)/

/**
 * Get the info about (Harness) modules system
 */
function getModules() {
  const modules = path.resolve(process.cwd(), 'src/modules')

  const dirs = fs.readdirSync(modules, { withFileTypes: true })

  const numberedDirs = dirs
    .map(dir => {
      if (!dir.isDirectory()) return null

      const match = dir.name.match(MODULE_REGEX)

      if (!match) return null

      const moduleNo = parseInt(match[1])

      if (Number.isNaN(moduleNo)) return

      return {
        dirName: dir.name,
        moduleName: match[2],
        moduleRef: _.camelCase(match[2]),
        moduleNo
      }
    })
    .filter(mod => mod)

  return _.sortBy(numberedDirs, mod => mod.dirName)
}

/**
 * Get the info about (Harness) modules system as layers
 * @param flatten {Boolean}
 */
function getLayers(flatten) {
  const modules = getModules()

  let layers = []

  modules.forEach(mod => {
    if (!Array.isArray(layers[mod.moduleNo])) {
      layers[mod.moduleNo] = []
    }

    layers[mod.moduleNo].push(mod)
  })

  layers = layers.filter(layer => layer)

  return flatten ? _.flatten(layers) : layers
}

module.exports.MODULE_REGEX = MODULE_REGEX
module.exports.getModules = getModules
module.exports.getLayers = getLayers
