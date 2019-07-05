import {Repository} from '../../common/repository/repository';
import {deviceModel} from './devices.model';

export class DeviceRepository extends Repository {
    constructor() {
        super(deviceModel);
        this.model = deviceModel;
    }

    findBySid(sid) {
        return this.model.findOne({sid})
    }

    findAllBySid(sid){
        return this.model.find({
            sid: {
                '$regex': sid,
            },

        })
    }

    getDevicesByUsersArray(usersIds) {
        return this.model.aggregate([
            {
                '$match': {
                    'coid': {
                        '$in': usersIds
                    },
                    deleted: {$ne: true}
                }
            }
        ])
    }

    deleteParent(sid) {
        return this.model.deleteOne({sid});
    }

    getDevicesByUserIds(ids) {
        return this.model.find({
            'coid': {
                '$in': ids
            },
            deleted: {$ne: true}
        })
    }

    createStructure(structure) {
        return this.model.insertMany(structure);
    }

    deleteStructure(base) {
        return this.model.deleteMany({
            sid: {
                '$regex': base
            }

        })
    }

    updateRemoveDeviceUsers(sid, coid) {
        return this.model.updateMany(
            {
                sid: {
                    '$regex': sid,
                },

            }, {$pullAll: {coid}});
    }

    updateAddDeviceUsers(sid, coid) {
        return this.model.updateMany(
            {
                sid: {
                    '$regex': sid,
                },

            }, {$addToSet: {coid}});
    }

    updateDevice(device) {
        return this.model.updateOne({_id: device._id}, device);
    }

    replaceUserForDevices(parentId, adminId) {
        return this.model.updateMany({coid: parentId}, {$set: {'coid.$': adminId}});
    }

    fakeDeleteStructure(sid) {
        return this.model.updateMany(
            {
                sid: {
                    '$regex': sid,
                },
            }, {deleted: true});
    }

    groupParents(){
        return this.model.aggregate([
            {
                '$match': {
                    'parent_id': '0'
                }
            }, {
                '$group': {
                    '_id': {
                        'class': '$type'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }
        ])
    }

    // for all firms
    groupByUsers(){
        return this.model.aggregate([
            {
                '$match': {
                    'deleted': false
                }
            },
            {
                '$unwind': {
                    'path': '$coid'
                }
            }, {
                '$group': {
                    '_id': {
                        'coid': '$coid'
                    },
                    'devices': {
                        '$push': {
                            'sid': '$sid'
                        }
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'coid': '$_id.coid',
                    'devices': 1
                }
            }
        ]);
    }

    // for one firm
    groupByCoid(coids){
        return this.model.aggregate([
            {
                '$match': {
                    'deleted': false,
                    coid: {
                        $in: coids
                    }
                }
            },
            {
                '$unwind': {
                    'path': '$coid'
                }
            }, {
                '$group': {
                    '_id': {
                        'coid': '$coid'
                    },
                    'count': {
                        '$sum': 1
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'coid': '$_id.coid',
                    'devices': 1,
                    count: 1
                }
            }
        ]);
    }
}

deviceModel.updateMany({deleted: true}, {deleted: false}).then(d => console.log(d)).catch(e => console.log(e));


