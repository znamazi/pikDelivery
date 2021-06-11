const multer = require('multer')
const mkdirp = require('mkdirp')
const fs = require('fs')

const multerStorage = (dirName) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      let dir = `user_files/upload/${dirName}/`
      mkdirp.sync(dir)
      cb(null, dir)
    },
    filename: (req, file, cb) => {
      let originalName = file.originalname.replace(/\s/g, '-')
      let filePath = `user_files/upload/${dirName}/` + originalName
      if (!fs.existsSync(filePath)) cb(null, originalName)
      else cb(null, Date.now() + '-' + originalName)
    }
  })
const multerFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(doc|docx|pdf|jpeg|jpg|png|mp4|wmv|avi)$/)) {
    return cb(new Error('Please upload appropriate format'))
  }
  cb(undefined, true)
}

const upload = (dirName) =>
  multer({
    storage: multerStorage(dirName),
    fileFilter: multerFilter
  })

exports.uploadFiles = upload
