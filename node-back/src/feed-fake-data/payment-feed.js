const documentsToFeed = require('./payment.json')
const Model = require('../models/Payment')

module.exports = function () {
  console.log('feeding payment ...')
  let i = -1
  const onDocumentSaved = () => {
    i++
    if (i < documentsToFeed.length) {
      // console.log("inserting document: ", documentsToFeed[i]);
      let doc = new Model(documentsToFeed[i])
      return doc.save().then(onDocumentSaved)
    }
  }
  return Promise.resolve().then(onDocumentSaved)
}
