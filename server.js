#!/usr/bin/env babel-node

require('./helper')
const fs = require('fs').promise
const express = require('express')
const path = require('path')
const trycatch = require('trycatch')

const FILE_DIR = 'path/to'

async function read(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = await fs.readFile(filePath).catch((err) => {
    res.end(err.message)
  })
  if (data) {
    res.end(data.toString())
  }
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

  app.listen(PORT);
  console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
}

initialize()
