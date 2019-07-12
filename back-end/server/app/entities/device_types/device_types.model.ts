import * as mongoose from 'mongoose';

const deviceTypesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    base: {
        type: String,
        required: true,
        unique: true
    },
    params: {
        type: {
            auto_desc: {
                type: String
            },
            parent_id: {
                type: String,
            }
        }
    },
}, {versionKey: false, collection: 'device_types'});

export const deviceTypesModel = mongoose.model('DeviceTypes', deviceTypesSchema);
