require('./helper')
const chokidar = require('chokidar')
const nssocket = require('nssocket')
const fs = require('fs')
const argv = require('yargs')
             .default('dir', 'path/to')
             .argv;

const log = console.log.bind(console);

const FILE_DIR = 'path/to/'

function notify(port, data) {
  const outbound = new nssocket.NsSocket({
    reconnect: true
  })
  outbound.connect(8001, '127.0.0.1', (err) => {
    if (err) {
      log(err.message)
    } else {
      outbound.send(['ownerName', 'action', 'path', 'fileContent'], data)
    }
  })
}

async function watchFile(ownerName) {
  chokidar.watch(FILE_DIR + argv.dir, { ignored: /[\/\\]\./, ignoreInitial: true })
  .on('add', path => {
    log('File ${path} has been added')
    notify({
      action: 'createFile',
      path,
      ownerName
    })
  })
  .on('change', path => {
    log('File ${path} has been changed')
    notify({
      action: 'update',
      path,
      fileContent: fs.readFileSync(path),
      ownerName
    })
  })
  .on('unlink', path => {
    log('File ${path} has been removed')
    notify({
      action: 'remove',
      path,
      ownerName
    })
  })
  .on('addDir', path => {
    log('Directory ${path} has been added')
    notify({
      action: 'createFolder',
      path,
      ownerName
    })
  })
  .on('unlinkDir', path => {
    log(`Directory ${path} has been removed`)
    notify({
      action: 'remove',
      path,
      ownerName
    })
  })
}

module.exports = watchFile
