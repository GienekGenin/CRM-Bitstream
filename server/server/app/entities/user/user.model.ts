import * as mongoose from 'mongoose';
import {rolesService} from '../roles/roles.service';
import {firmService} from '../firm/firm.service';

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	surname: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	tel: {
		type: String,
		required: true
	},
	firm_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Firm',
		validate: {
			isAsync: true,
			validator: (v) =>  firmService.findById(v),
			message: 'Firm with such _id does not exist'
		},
	},
	role_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Roles',
		validate: {
			isAsync: true,
			validator: (v) =>  rolesService.findById(v),
			message: 'Role with such _id does not exist'
		},
	}
}, {versionKey: false, collection: 'users'});

export const userModel = mongoose.model('User', userSchema);


