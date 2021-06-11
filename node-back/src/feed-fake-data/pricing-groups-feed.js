const documentsToFeed = require('./pricing-groups.json')
const Model = require('../models/PricingGroup')

module.exports = function () {
  console.log('feeding pricing-groups ...')
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
