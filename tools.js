const fs = require('fs').promise
const mime = require('mime-types')
const path = require('path')

const FILE_DIR = 'server'

module.exports = {
  fileExist: async (req, res, next) => {
    const filePath = path.join(__dirname, FILE_DIR, req.url)
    let isfileExist = true
    await fs.stat(filePath).catch((err) => {
      if (err) {
        res.sendStatus(404).end('File not found')
        isfileExist = false
      }
    })
    if (isfileExist) {
      next()
    }
  },

  setHeaders: (res, filePath) => {
    res.setHeader('Content-Length', filePath.length)
    res.setHeader('Content-Type', mime.lookup(filePath))
  }
}
