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

    getData(body) {
        return this.model.aggregate([
            {
                '$match': {
                    $and: [
                        {ts: {$gte: new Date(body.minSelectedDate)}},
                        {ts: {$lte: new Date(body.maxSelectedDate)}},
                        {device_id: {$in: body.sids}},
                        {
                            $or: [
                                {value: {$type: 'double'}},
                                {value: {$type: 'int'}},
                                {value: {$type: 'long'}},
                                {value: {$type: 'array'}},
                                {value: {$in: ['ONLINE', 'OFFLINE']}}
                            ]
                        }
                    ]
                }
            },
            {
                '$group': {
                    '_id': {
                        'sid': '$device_id',
                        'dayOfYear': {
                            '$dayOfYear': '$ts'
                        },
                        'hour': {
                            '$hour': '$ts'
                        },
                        'interval': {
                            '$subtract': [
                                {
                                    '$minute': '$ts'
                                }, {
                                    '$mod': [
                                        {
                                            '$minute': '$ts'
                                        }, 10
                                    ]
                                }
                            ]
                        }
                    },
                    'data': {
                        '$push': {
                            'value': '$value',
                            'ts': '$ts'
                        }
                    },
                    'count': {
                        '$sum': 1
                    }
                }
            }, {
                '$project': {
                    'minData': {
                        '$min': '$data'
                    },
                    'maxData': {
                        '$max': '$data'
                    }
                }
            }, {
                '$group': {
                    '_id': {
                        'sid': '$_id.sid'
                    },
                    'mins': {
                        '$push': '$minData'
                    },
                    'maxs': {
                        '$push': '$maxData'
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'data': {
                        '$concatArrays': [
                            '$mins', '$maxs'
                        ]
                    },
                    'sid': '$_id.sid'
                }
            }, {
                '$unwind': {
                    'path': '$data',
                    'preserveNullAndEmptyArrays': false
                }
            }, {
                '$sort': {
                    'data.ts': 1
                }
            }, {
                '$group': {
                    '_id': {
                        'sid': '$sid'
                    },
                    'data': {
                        '$push': '$data'
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'data': 1,
                    'sid': '$_id.sid'
                }
            }
        ])
    }

    getDevicesWithData(body) {
        return this.model.aggregate([
            {
                '$match': {
                    $and: [
                        {device_id: {$in: body.sids}},
                        {
                            $or: [
                                {value: {$type: 'double'}},
                                {value: {$type: 'int'}},
                                {value: {$type: 'long'}},
                                {value: {$type: 'array'}},
                                {value: {$in: ['ONLINE', 'OFFLINE']}}
                            ]
                        }
                    ]
                }
            },
            {
                '$group': {
                    '_id': {
                        'sid': '$device_id'
                    }
                }
            }
        ])
    }
}
