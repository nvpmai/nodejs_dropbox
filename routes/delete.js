const path = require('path')
const express = require('express')
const rimraf = require('rimraf')

const router = express.Router()

const FILE_DIR = '../server'

async function remove(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  await rimraf(filePath, (err) => {
    if (err) {
      res.end(err.toString())
    } else {
      res.end()
    }
  })
}

router.delete('*', remove)

module.exports = router
