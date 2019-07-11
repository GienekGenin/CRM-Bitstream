import * as mongoose from 'mongoose';

export const rolesModel = mongoose.model('Roles', new mongoose.Schema({
    role: {
        type: String,
        unique: true,
        required: true
    }
}, {versionKey: false, collection: 'user_roles'}));
