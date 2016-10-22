#!/usr/bin/env babel-node

require('./helper')
const fs = require('fs').promise
const express = require('express')
const path = require('path')
const trycatch = require('trycatch')
const mime = require('mime-types')
const bodyParser = require('body-parser')

const FILE_DIR = 'path/to'

function setHeaders(res, data) {
  res.setHeader('Content-Length', data.length)
  res.setHeader('Content-Type', mime.lookup(data))
}

async function sendHeaders(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = await fs.readFile(filePath).catch((err) => {
    if (!err) {
      setHeaders(res, data)
    }
  })
  res.end()
}

async function read(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = await fs.readFile(filePath).catch((err) => {
    if (err.code === 'ENOENT') {
      res.end('File not found')
    } else if (err.code === 'EISDIR') {
      res.end('Directory not found')
    } else {
      res.end(err.toString())
    }
  })
  if (data) {
    setHeaders(res, data)
    res.end(data.toString())
  }
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

async function update(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  await fs.writeFile(filePath, req.body).catch((err) => {
    if (err.code === 'ENOENT') {
      res.end('File not found')
    } else {
      res.end(err.toString())
    }
  })
  res.end()
}

async function remove(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  await fs.unlink(filePath).catch((err) => {
    if (err.code === 'ENOENT') {
      res.end('File not found')
    } else {
      res.end(err.toString())
    }
  })
  res.end()
}

async function initialize() {
  const app = express()
  app.use((req, res, next) => {
    trycatch(next, e => {
      console.log(e.stack)
      res.writeHead(500)
      res.end(e.stack)
    })
  })

  const PORT = 8000
  app.get('*', read)
  app.head('*', sendHeaders)
  app.put('*', create)
  app.post('*', bodyParser.raw({type: '*/*'}), update)
  app.delete('*', remove)

  app.listen(PORT);
  console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
}

initialize()
