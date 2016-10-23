const tools = require('../tools');
const archiver = require('archiver')
const path = require('path')
const fs = require('fs').promise
const express = require('express')

const router = express.Router()

const FILE_DIR = '../path/to'

function getArchive(res, filePath) {
  const archive = archiver('zip')
  archive.pipe(res)
  archive.directory(filePath, '', { name: 'ok'})
  archive.finalize()
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
      tools.setHeaders(res, filePath)
      res.send(data);
    }
  }
}

router.get('*', tools.fileExist, read)

module.exports = router
