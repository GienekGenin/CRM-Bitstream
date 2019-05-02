import * as mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    device_id: {
        type: String,
        required: true
    },
    ts: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false, collection: 'data'});

export const dataModel = mongoose.model('Data', dataSchema);




