#!/usr/bin/env babel-node

require('./helper')
const express = require('express')
const trycatch = require('trycatch')

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

// app.head('*', fileExist, sendHeaders)

app.listen(PORT)
console.log(`LISTENING @ http://127.0.0.1:${PORT}`)
