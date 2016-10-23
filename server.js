#!/usr/bin/env babel-node

require('./helper')
const fs = require('fs').promise
const express = require('express')
const path = require('path')
const trycatch = require('trycatch')
const mime = require('mime-types')
const bodyParser = require('body-parser')
const archiver = require('archiver')
const rimraf = require('rimraf')

const FILE_DIR = 'path/to'

async function sendHeaders(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = await fs.readFile(filePath).catch((err) => {
    if (err) {
      res.end(err.message)
    } else {
      setHeaders(res, data)
    }
  })
  res.end()
}

async function create(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  await fs.open(filePath, 'wx').catch((err) => {
    if (err.code === 'EEXIST') {
      res.end('File already existed')
    } else {
      res.end(err.toString())
    }
  })
  res.end()
}

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

const app = express()
app.use(require('./routes/get'))
app.use(require('./routes/post'))

app.use((req, res, next) => {
  trycatch(next, e => {
    console.log(e.stack)
    res.writeHead(500)
    res.end(e.stack)
  })
})

const PORT = 8000

// app.head('*', fileExist, sendHeaders)
// app.put('*', create)
// app.delete('*', fileExist, remove)

app.listen(PORT)
console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
