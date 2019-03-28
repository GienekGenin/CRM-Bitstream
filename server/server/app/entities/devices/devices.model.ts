import * as mongoose from 'mongoose';
import {usersService} from '../user/user.service';
import {deviceService} from './devices.service';

const deviceSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	sid: {
		type: String,
		required: true,
		unique: true
	},
	type: {
		type: mongoose.Types.ObjectId
	},
	phyid: {
		type: String,
		required: true
	},
	coid: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		validate: {
			isAsync: true,
			validator: (v) => usersService.findById(v),
			message: 'User with such _id does not exist'
		}
	}],
	description: {
		type: String
	},
	sn: {
		type: String
	},
	soft: {
		type: String
	},
	location: {
		type: [mongoose.Schema.Types.Number]
	},
	parent_id: {
		type: String,
		ref: 'Device',
		validate: {
			isAsync: true,
			validator: (v) => deviceService.findBySid(v),
			message: 'Parent device with such sid does not exist'
		}
	},
	con_type: {
		type: String
	},
	lvl: {
		type: mongoose.Schema.Types.Number,
		required: true
	}
}, {versionKey: false, collection: 'devices'});

export const deviceModel = mongoose.model('Device', deviceSchema);




