import * as mongoose from 'mongoose';
import {usersService} from '../user/user.service';
import {deviceService} from './devices.service';

const deviceSchema = new mongoose.Schema({
	sid: {
		type: String,
		required: true,
		unique: true
	},
	status: String,
	owners: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		validate: {
			isAsync: true,
			validator: (v) => usersService.getById(v),
			message: 'User with such _id does not exist'
		},
	}],
	address: {
		type: String
	},
	parentSID: {
		type: String,
		ref: 'Device',
		validate: {
			isAsync: true,
			validator: (v) => deviceService.getById(v),
			message: 'Parent device with such sid does not exist'
		}
	}
}, {versionKey: false, collection: 'devices'});

export const deviceModel = mongoose.model('Device', deviceSchema);




