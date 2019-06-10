import * as mongoose from 'mongoose';

const data_10Schema = new mongoose.Schema({
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    ts: {
        type: Date,
        required: true,
        default: Date.now
    },
    ttl: {
        type: Number,
        default: 60
    }
}, {versionKey: false, collection: 'data_10'});

data_10Schema.index({device_id: 1, ts: 1}, {unique: true});

export const data_10Model = mongoose.model('Data_10', data_10Schema);

