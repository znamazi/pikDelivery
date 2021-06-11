const mongoose = require('mongoose')

const COLLECTION_NAME = 'mongoose-auto-inc'

const modelSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 1 }
})
const AutoInc = mongoose.model(COLLECTION_NAME, modelSchema)
module.exports = AutoInc

function createEntry(model) {
  return new Promise(function (resolve, reject) {
    model
      .find({})
      .sort({ id: -1 })
      .limit(1)
      .toArray((err, docs) => {
        if (err) return reject(err)
        const doc = docs[0] || {}
        var max = parseInt(doc.id || '0')
        let counter = new AutoInc({ _id: model.name, seq: max + 2 })
        counter
          .save()
          .then(() => {
            counter.seq = counter.seq - 1
            resolve(counter)
          })
          .catch(reject)
      })
  })
}

const nextIds = {}

module.exports.getNext = (model) => {
  return new Promise(function (resolve, reject) {
    AutoInc.findByIdAndUpdate({ _id: model.name }, { $inc: { seq: 1 } })
      .then((counter) => {
        if (!counter) return createEntry(model)
        else return counter
      })
      .then((counter) => {
        resolve(counter.seq)
      })
      .catch(reject)
  })
}
module.exports.COLLECTION_NAME = COLLECTION_NAME
