require('dotenv').config()

const baseUrl = process.env.BASE_URL ?? 'https://qa.harness.io/gateway'
const targetLocalHost = JSON.parse(process.env.TARGET_LOCALHOST || 'true')

console.table({ baseUrl, targetLocalHost })

module.exports = {
  '/pm': {
    target: targetLocalHost ? 'http://localhost:3000' : baseUrl,
    pathRewrite: { '^/pm': '' }
  }
}
