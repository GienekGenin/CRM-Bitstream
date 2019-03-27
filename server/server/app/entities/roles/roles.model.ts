import * as mongoose from 'mongoose';

export const rolesModel = mongoose.model('Roles', new mongoose.Schema({
	role: String
}, {versionKey: false, collection: 'user_roles'}));
