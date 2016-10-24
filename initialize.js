require('./helper')
const express = require('express')
const trycatch = require('trycatch')
const watchFile = require('./watchFile')
const nssocket = require('nssocket')

async function initialize(ownerName, dir, port) {
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

  watchFile(dir, socket)
  app.listen(port)
  console.log(`${ownerName} is listening at port ${port}`)
}

module.exports = initialize
