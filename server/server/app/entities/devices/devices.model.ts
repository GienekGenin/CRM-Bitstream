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
	auto_desc: {
		type: String
	},
	user_desc: {
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
		// validate: {
		// 	isAsync: true,
		// 	validator: (v) => deviceService.validateBySid(v),
		// 	message: 'Parent device with such sid does not exist'
		// },
	},
	con_type: {
		type: String
	},
	units: {
		type: String
	},
	version: {
		type: String
	},
	time: {
		type: Date,
	},
	value: {
		type: mongoose.Schema.Types.Mixed,
	},
	status: {
		type: String
	},
	deleted: {
		type: Boolean,
		required: true,
		default: false
	}
}, {versionKey: false, collection: 'devices'});

export const deviceModel = mongoose.model('Device', deviceSchema);

