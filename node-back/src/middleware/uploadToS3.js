const multer = require('multer')
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')
const multerSharpS3 = require('multer-sharp-s3')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
  signatureVersion: 'v4',
  region: process.env.AWS_REGION
})

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: process.env.AWS_BUCKET_PUBLIC,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
})

//  This function for delete file from s3 bucket

const s3Delete = (fileName) => {
  s3.deleteObject(
    {
      Bucket: process.env.AWS_BUCKET_PUBLIC,
      Key: fileName
    },
    function (err, data) {
      if (err) console.log('Error happend in S3 Delete:', err)
      else console.log('Successfully deleted file from bucket')
      console.log('Data:', data)
    }
  )
}

const uploadS3Private = multer({
  storage: multerS3({
    s3: s3,
    acl: 'private',
    bucket: process.env.AWS_BUCKET_PRIVATE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname)
    }
  })
})

function s3PrivateUrl(url) {
  const params = {
    Bucket: process.env.AWS_BUCKET_PRIVATE,
    Expires: 900,
    Key: url.split('/').pop()
  }
  return s3.getSignedUrl('getObject', params)
}

const multerSharpStorage = (width, height) =>
  multerSharpS3({
    Key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname)
    },
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname })
    },
    s3,
    Bucket: process.env.AWS_BUCKET_PUBLIC,
    ACL: 'public-read',
    resize: {
      width,
      height
    }
  })
const resizeBeforeUpload = (width, height) =>
  multer({ storage: multerSharpStorage(width, height) })
module.exports = {
  s3PrivateUrl,
  uploadS3,
  uploadS3Private,
  s3Delete,
  resizeBeforeUpload
}
