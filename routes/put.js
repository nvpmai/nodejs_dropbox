const path = require('path')
const fs = require('fs').promise
const express = require('express')
const bodyParser = require('body-parser')

const router = express.Router()

const FILE_DIR = '../server'

function createFolder(req, res, next) {
  if (req.url.slice(-1) === '/') {
    const filePath = path.join(__dirname, FILE_DIR, req.url)
    fs.mkdir(filePath).catch((err) => {
      if (err.code === 'EEXIST') {
        res.end('Folder already existed')
      }
    })
  } else {
    next()
  }
}

async function createFile(req, res, next) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  let isError = false
  await fs.open(filePath, 'wx').catch((err) => {
    if (err) {
      isError = true
      if (err.code === 'EEXIST') {
        res.end('File already existed')
      } else {
        res.end(err.toString())
      }
    }
  })
  if (!isError) {
    next()
  }
  res.end()
}

async function writeToFile(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const body = (req.body.length === undefined) ? '' : req.body
  await fs.writeFile(filePath, body)
  res.end()
}

router.put('*', createFolder, createFile, bodyParser.raw({ type: '*/*' }), writeToFile)

module.exports = router
