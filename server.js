#!/usr/bin/env babel-Node

require('./helper')
const express = require('express')
const trycatch = require('trycatch')
const watchFile = require('./watchFile')
const nssocket = require('nssocket')
const path = require('path')

async function initialize(myPort, otherPort) {
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
    })
  })

  const socket = new nssocket.NsSocket({
    reconnect: true
  })

  watchFile(('server'), socket, otherPort)
  app.listen(myPort)
  console.log(`Server is listening at port ${myPort}`)
}

initialize(8000, 8001)
