import {Repository} from '../../common/repository/repository';
import {deviceModel} from './devices.model';

export class DeviceRepository extends Repository{
	constructor(){
		super(deviceModel);
		this.model = deviceModel;
	}

	findBySid(sid){
		return this.model.findOne({sid})
	}

	getDevicesByUsersArray(usersIds){
		return this.model.aggregate([
			{
				'$match': {
					'coid': {
						'$in': usersIds
					}
				}
			}
		])
	}

	deleteParent(sid){
		return this.model.deleteOne({sid});
	}

	getDevicesByUserId(id){
		return this.model.find({
			'coid': {
				'$in': [
					id
				]
			}
		})
	}

	createStructure(structure){
		return this.model.insertMany(structure);
	}

	deleteStructure(base){
		return this.model.deleteMany({      sid: {
				'$regex': base
			}

		})
	}
}
