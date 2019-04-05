import * as mongoose from 'mongoose';
import {firmService} from './firm.service';

export const firmModel = mongoose.model('Firm', new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	address: {
		type: String,
		required: true
	},
	email: {
		type: String,
		unique: true,
		required: true
	},
	tel: {
		type: String,
		required: true
	},
	nip: {
		type: String,
		unique: true,
		required: true
	},
	parent_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Firm',
		validate: {
			isAsync: true,
			validator: (v) =>  {
				if(v) firmService.findById(v);
				return true;
			},
			message: 'Firm with such _id does not exist'
		},

	}
}, {versionKey: false, collection: 'firms'}));
