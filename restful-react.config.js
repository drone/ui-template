/**
 * Please match the config key to the directory under services.
 * This is required for the transform to work
 */
const customGenerator = require('./scripts/swagger-custom-generator.js')

module.exports = {
  petstore: {
    output: 'src/services/petstore/index.tsx',
    file: 'src/services/petstore/swagger.json',
    transformer: 'scripts/swagger-transform.js',
    customImport: `import { getConfig } from "../config";`,
    customProps: {
      base: `{getConfig("petstore")}`,
    },
  },
}
