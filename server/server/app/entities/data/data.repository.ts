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

    getData(body){
        return this.model.aggregate([
            {
                '$match': {
                    $and: [
                        {ts: {$gte: new Date(body.minSelectedDate)}},
                        {ts: {$lte: new Date(body.maxSelectedDate)}},
                        {$or: [
                                {value: {$type: 'double'}},
                                {value: {$type: 'int'}},
                                {value: {$type: 'long'}},
                                {value: {$in: ['ONLINE', 'OFFLINE']}}
                            ]}
                    ]
                }
            }, {
                '$group': {
                    '_id': {
                        'sid': '$device_id'
                    },
                    'data': {
                        '$push': {
                            'value': '$value',
                            'ts': '$ts'
                        }
                    }
                }
            }
        ])
    }
}
