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
}
