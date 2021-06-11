const mongoose = require('mongoose');

const COLLECTION_NAME = 'setting';

const DefaultSettings = {
};

let settingsSchema = mongoose.Schema({
    key: {type: String, required: true, unique: true},
    value: {type: Object, default: {}},
}, {
    timestamps: true
});
let model = mongoose.model(COLLECTION_NAME, settingsSchema);
module.exports = model
module.exports.get = key => {
    return model.findOne({key}).then(doc => (doc?doc.value:null))
}
module.exports.COLLECTION_NAME = COLLECTION_NAME;
