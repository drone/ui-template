require('dotenv').config()

const baseUrl = process.env.BASE_URL ?? 'https://qa.harness.io/gateway'
const targetLocalHost = JSON.parse(process.env.TARGET_LOCALHOST || 'true')

console.table({ baseUrl, targetLocalHost })

module.exports = {
  // NOTE: This petstore service is a sample service to show case Restful service generation. Remove it
  // in your application along with command `services:petstore` in package.json and src/services/petstore.
  '/petstore': {
    target: targetLocalHost ? 'https://petstore.swagger.io/v2' : baseUrl,
    pathRewrite: { '^/petstore': '' },
  },
}
