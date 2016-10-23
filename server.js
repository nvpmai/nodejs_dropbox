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

function fileExist(req, res, next) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const data = fs.stat(filePath).catch((err) => {
    if (err) {
      res.sendStatus(404).end('File not found')
    }
  })
  if (data) {
    next()
  }
}

function getArchive(res, filePath) {
  const archive = archiver('zip')
  archive.pipe(res)
  archive.directory(filePath, '', { name: 'ok'})
  archive.finalize()
}

function setHeaders(res, filePath) {
  res.setHeader('Content-Length', filePath.length)
  res.setHeader('Content-Type', mime.lookup(filePath))
}

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

async function read(req, res) {
  const filePath = path.join(__dirname, FILE_DIR, req.url)
  const stat = await fs.stat(filePath)
  if (stat.isDirectory()) {
    getArchive(res, filePath)
  } else {
    const data = await fs.readFile(filePath).catch((err) => {
      if (err) {
        res.end(err.toString())
      }
    });
    if (data) {
      setHeaders(res, filePath)
      res.send(data);
    }
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
    if (err) {
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
  app.get('*', fileExist, read)
  app.head('*', fileExist, sendHeaders)
  app.put('*', create)
  app.post('*', fileExist, bodyParser.raw({type: '*/*'}), update)
  app.delete('*', fileExist, remove)

  app.listen(PORT);
  console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
}

initialize()
