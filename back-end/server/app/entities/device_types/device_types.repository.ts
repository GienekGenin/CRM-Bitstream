import {Repository} from '../../common/repository/repository';
import {deviceTypesModel} from './device_types.model';

export class DeviceTypesRepository extends Repository {
    constructor() {
        super(deviceTypesModel);
        this.model = deviceTypesModel;
    }

    getAllToUI(){
        return this.model.find().select(['_id', 'name']);
    }
}
