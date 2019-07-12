import {Repository} from '../../common/repository/repository';
import {dataModel} from './data.model';

export class DataRepository extends Repository {
    constructor() {
        super(dataModel);
        this.model = dataModel;
    }

    /**
     * Returns latest data record
     * @param deviceIds: string[]
     * @return Object
     */
    getMaxTime(deviceIds) {
        return this.model.findOne({
            device_id: {$in: deviceIds}
        }).sort({ts: -1}).select({ts: 1, _id: 0});
    }

    /**
     * Returns the earliest data record
     * @param deviceIds: string[]
     * @return Object
     */
    getMinTime(deviceIds) {
        return this.model.findOne({
            device_id: {$in: deviceIds}
        }).sort({ts: 1}).select({ts: 1, _id: 0});
    }

    /**
     * Returns grouped data by deviceId
     * @param body: Object
     * @return Object[]
     */
    getAllData(body) {
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
            // {
            //     '$sort': {
            //         'ts': 1
            //     }
            // },
            {
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
            },
            {
                '$project': {
                    '_id': 0,
                    'data': 1,
                    'sid': '$_id.sid'
                }
            }
        ])
    }

    /**
     * Returns reduced and grouped data by deviceIds
     * @param body: Object
     * @param zoom: number
     * @return Object[]
     */
    getDataWithZoom(body, zoom) {
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
                                        }, zoom
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
            },
            // {
            //     '$sort': {
            //         'data.ts': 1
            //     }
            // },
            {
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

    /**
     * Returns number of docs by each device
     * @param body: Object
     * @return Object[]
     */
    countDataByDevice(body) {
        return this.model.aggregate([
            {
                '$match': {
                    $and: [
                        {ts: {$gte: new Date(body.minSelectedDate)}},
                        {ts: {$lte: new Date(body.maxSelectedDate)}},
                        {device_id: {$in: body.sids}},
                        {
                            '$or': [
                                {
                                    'value': {
                                        '$type': 'double'
                                    }
                                }, {
                                    'value': {
                                        '$type': 'int'
                                    }
                                }, {
                                    'value': {
                                        '$type': 'long'
                                    }
                                }, {
                                    'value': {
                                        '$in': [
                                            'ONLINE', 'OFFLINE'
                                        ]
                                    }
                                }
                            ]
                        }
                    ]
                }
            }, {
                '$group': {
                    '_id': {
                        'sid': '$device_id'
                    },
                    'count': {
                        '$sum': 1
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'sid': '$_id.sid',
                    'count': 1
                }
            }
        ])
    }

    /**
     * Returns grouped data by deviceId
     * @param body: Object
     * @return Object[]
     */
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

    /**
     * Returns number docs by each device
     * @param sids: string[]
     * @return Object[]
     */
    countByDeviceIds(sids) {
        return this.model.aggregate([
            {
                $match: {
                    device_id: {
                        $in: sids
                    }
                }
            },
            {
                $group: {
                    _id: {
                        sid: '$device_id'
                    },
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $project: {
                    sid: '$_id.sid',
                    count: 1,
                    _id: 0
                }
            }
        ])
    }
}
