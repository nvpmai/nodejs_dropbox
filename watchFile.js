require('./helper')
const chokidar = require('chokidar')
const pathModule = require('path')
const fs = require('fs')
const argv = require('yargs')
             .default('dir', '')
             .argv;

const log = console.log.bind(console);

function notify(socket, port, data) {
  socket.connect(8001, '127.0.0.1', (err) => {
    if (err) {
      log(err.message)
    } else {
      socket.send(['action', 'path', 'fileContent'], data)
    }
  })
}

async function watchFile(dir, socket) {
  chokidar.watch(pathModule.join(dir, argv.dir), { ignored: /[\/\\]\./, ignoreInitial: true })
  .on('add', path => {
    log(`File ${path} has been added`)
    notify(socket, '', {
      action: 'createFile',
      path
    })
  })
  .on('change', path => {
    log(`File ${path} has been changed`)
    notify(socket, '', {
      action: 'update',
      path,
      fileContent: fs.readFileSync(path)
    })
  })
  .on('unlink', path => {
    log(`File ${path} has been removed`)
    notify(socket, '', {
      action: 'remove',
      path
    })
  })
  .on('addDir', path => {
    log(`Directory ${path} has been added`)
    notify(socket, '', {
      action: 'createFolder',
      path
    })
  })
  .on('unlinkDir', path => {
    log(`Directory ${path} has been removed`)
    notify(socket, '', {
      action: 'remove',
      path
    })
  })
}

module.exports = watchFile
