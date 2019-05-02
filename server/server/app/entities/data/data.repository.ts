import {Repository} from '../../common/repository/repository';
import {dataModel} from './data.model';

export class DataRepository extends Repository {
    constructor() {
        super(dataModel);
        this.model = dataModel;
    }

    getMaxTime(deviceIds) {
        return this.model.findOne({
            device_id: {$in: deviceIds}
        }).sort({ts: -1}).select({ts: 1, _id: 0});
    }

    getMinTime(deviceIds) {
        return this.model.findOne({
            device_id: {$in: deviceIds}
        }).sort({ts: 1}).select({ts: 1, _id: 0});
    }
}
