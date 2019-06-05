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
    status: [
        {
            type: String
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {versionKey: false, collection: 'data'});

dataSchema.index({device_id: 1, ts: 1}, {unique: true});

export const dataModel = mongoose.model('Data', dataSchema);
// dataModel.remove({device_id: 'SX5cadc29a89717b2da0fc0de2:HYP0:PTPOM'}).then(()=>console.log(1, 'done'));
