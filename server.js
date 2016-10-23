#!/usr/bin/env babel-node

require('./helper')
const express = require('express')
const trycatch = require('trycatch')
const chokidar = require('chokidar')
const nssocket = require('nssocket')
const argv = require('yargs')
             .default('dir', 'path/to')
             .argv;

const log = console.log.bind(console);

async function initialize() {
  const app = express()
  app.use(require('./routes/get'))
  app.use(require('./routes/post'))
  app.use(require('./routes/put'))
  app.use(require('./routes/delete'))
  app.use(require('./routes/head'))

  app.use((req, res, next) => {
    trycatch(next, e => {
      console.log(e.stack)
      res.writeHead(500)
      res.end(e.stack)
    })
  })

  const PORT = 8000
  app.listen(PORT)
  console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
}

function sendToClients(data) {
  const outbound = new nssocket.NsSocket({
    reconnect: true
  })
  outbound.connect(8001, '127.0.0.1', (err) => {
    if (err) {
      log(err.message)
    } else {
      outbound.send(['action', 'path'], data)
    }
  })
}

async function watch() {
  chokidar.watch('./' + argv.dir, { ignored: /[\/\\]\./})
  .on('add', path => {
    log('File ${path} has been added')
    sendToClients({
      action: 'createFile',
      path
    })
  })
  .on('change', path => {
    log('File ${path} has been changed')
    sendToClients({
      action: 'update',
      path,
      fileContent: readFile(path)
    })
  })
  .on('unlink', path => {
    log('File ${path} has been removed')
    sendToClients({
      action: 'remove',
      path
    })
  })
  .on('addDir', path => {
    log('Directory ${path} has been added')
    sendToClients({
      action: 'createFolder',
      path
    })
  })
  .on('unlinkDir', path => {
    log(`Directory ${path} has been removed`)
    sendToClients({
      action: 'remove',
      path
    })
  })
}

watch()
initialize()
