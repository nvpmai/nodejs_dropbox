const unzip = require('unzip')
const fs = require('fs').promise
const request = require('request')
const chokidar = require('chokidar')
const nssocket = require('nssocket')
const path = require('path')
const rimraf = require('rimraf')

const log = console.log.bind(console);

const CLIENT_PATH = 'client'

async function getFileAtStart() {
  const options = {
    uri: 'http://localhost:8000/',
    method: 'get',
    headers: {
      Accept: 'application/x-gtar'
    }
  }
  request(options).pipe(unzip.Extract({ path: 'client/' }))
}

async function handleData(data) {
  const filePath = path.join(CLIENT_PATH, data.path)
  if (data.action === 'createFile') {
    fs.open(filePath, 'w')
  } else if (data.action === 'update') {
    await fs.writeFile(filePath).catch((err) => {
      if (err) {
        log(err.toString())
      }
    })
  } else if (data.action === 'remove') {
    console.log("somefile has beeen deleted")
    await rimraf(filePath, (err) => {
      if (err) {
        log(err.toString())
      }
    })
  } else if (data.action === 'createFolder') {
    fs.mkdir(path).catch((err) => {
      if (err) {
        console.log(err.message)
      }
    })
  }
}

async function watchFile() {
  chokidar.watch('client', { ignored: /[\/\\]\./, ignoreInitial: true })
  .on('addDir', (filePath) => {
    log(`Folder ${path} has been added`)
    request.put('http://localhost:8000/' + filePath + '/')
  })
  .on('unlinkDir', (filePath) => {
    log(`Folder ${path} has been removed`)
    request.delete('http://localhost:8000/' + filePath)
  })
  .on('unlink', (filePath) => {
    log(`File ${path} has been removed`)
    request.delete('http://localhost:8000/' + filePath)
  })
  .on('add', (filePath) => {
    log(`File ${path} has been added`)
    fs.readFile(path, (err, data) => {
      if (err) {
        console.log(err.message)
      } else {
        request({
          uri: 'http://localhost:8000/' + filePath,
          method: 'PUT',
          body: data
        })
      }
    })
  })
}

async function initialize() {
  const client = nssocket.createServer((socket) => {
    socket.data(['action', 'path', 'fileContent'], data => {
      handleData(data)
    })
  })
  client.listen(8001)
  getFileAtStart()
  console.log('client listen at port 8001');
}

watchFile()
initialize()
