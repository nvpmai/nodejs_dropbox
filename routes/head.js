const fs = require('fs').promise
const path = require('path')
const tools = require('../tools')
const express = require('express')

const router = express.Router()

const FILE_DIR = '../server'

async function sendHeaders(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = await fs.readFile(filePath).catch((err) => {
    if (err) {
      res.end(err.message)
    } else {
      tools.setHeaders(res, data)
    }
  })
  res.end()
}

router.head('*', tools.fileExist, sendHeaders)

module.exports = router
