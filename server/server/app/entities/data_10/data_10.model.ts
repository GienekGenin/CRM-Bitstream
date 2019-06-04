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

data_10Schema.index({ttl: 1});

data_10Schema.indexes().forEach(el => console.log(el));

export const data_10Model = mongoose.model('Data_10', data_10Schema);

