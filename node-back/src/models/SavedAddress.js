const mongoose = require('mongoose');
const Customer = require('./Customer');

const COLLECTION_NAME = 'saved-address';

const modelSchema = new mongoose.Schema({
    ownerModel: {
        type: String,
        required: true,
        enum: [Customer.COLLECTION_NAME]
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'ownerModel'
    },
    name: {type: String, required: true},
    address: {type: Object, required: true},
},
{
    timestamps: true
}
)

module.exports = mongoose.model(COLLECTION_NAME, modelSchema);
module.exports.COLLECTION_NAME = COLLECTION_NAME;
