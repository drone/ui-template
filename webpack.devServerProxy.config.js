require('dotenv').config()

const baseUrl = process.env.BASE_URL ?? 'https://qa.harness.io/gateway'
const targetLocalHost = (process.env.TARGET_LOCALHOST && JSON.parse(process.env.TARGET_LOCALHOST)) ?? true

console.table({ baseUrl, targetLocalHost })

module.exports = {
  '/ti-service': {
    target: targetLocalHost ? 'https://localhost:7457' : baseUrl
  }
}
