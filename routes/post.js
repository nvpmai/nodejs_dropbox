const tools = require('../tools');
const path = require('path')
const fs = require('fs').promise
const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()

const FILE_DIR = '../server'

async function update(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const body = (req.body.length === undefined) ? '' : req.body
  await fs.writeFile(filePath, body).catch((err) => {
    if (err) {
      res.end(err.toString())
    }
  })
  res.end()
}

router.post('*', tools.fileExist, bodyParser.raw({ type: '*/*' }), update)

module.exports = router
