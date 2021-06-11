const AutoInc = require('./MongooseAutoIncrement')
const {Semaphore} = require('await-semaphore');
const semaphore = new Semaphore(1);

const nextIds = {};

const getNextId = model => {
  return new Promise(async (resolve, reject) => {
    const collectionName = model.name;
    let release = await semaphore.acquire();
    try {
      if (nextIds[collectionName] !== undefined){
        nextIds[collectionName] = nextIds[collectionName] + 1;
        resolve(nextIds[collectionName]);
      }
      else {
        const docs = await model.find({})
          .sort({id: -1})
          .limit(1).toArray();
        let doc = docs[0] || {};
        let max = parseInt(doc.id || '0');
        nextIds[collectionName] = max + 1;
        resolve(nextIds[collectionName]);
      }
      release()
    }catch (error) {
      release();
      reject(error);
    }
  })
}

module.exports = function autoIncrementPlugin(schema, options) {

  schema.add({
    id: {type: Number, unique: true}
  });

  if(schema.methods.generateAutoInc === undefined){
    schema.methods.generateAutoInc = async function () {
      if(this.id === undefined){
        let nextId = await getNextId(this.collection)
        console.log(`Next autoInc: ${nextId}`)
        this.id = nextId
      }
    }
  }

  const OnSaveHook = function (next) {
    const doc = this;
    Promise.resolve()
      .then(() => {
        // console.log(options, schema);
        if(doc.id) {
          // if(!nextIds[doc.collection.name] || parseInt(doc.id) > nextIds[doc.collection.name]){
          //   nextIds[doc.collection.name] = parseInt(doc.id);
          // }
          return doc.id

        }else
          return getNextId(doc.collection)
      })
      .then(id => {
        doc.id = id;
        next();
      })
      .catch(error => {
        next(error);
      })
  }

  schema.pre('save', OnSaveHook);
};
