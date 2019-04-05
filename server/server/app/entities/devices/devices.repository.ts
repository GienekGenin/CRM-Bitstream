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
}
