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

    /**
     * Returns all devices for selected userIds
     * @param usersIds: string[]
     * @return Object[]
     */
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

    /**
     * Returns all devices for selected userIds
     * @param ids: string[]
     * @return Object[]
     */
    getDevicesByUserIds(ids) {
        return this.model.find({
            'coid': {
                '$in': ids
            },
            deleted: {$ne: true}
        })
    }

    /**
     * Removes users from devices
     * @param sid: string
     * @param coid: string
     * @return Object[]
     */
    updateRemoveDeviceUsers(sid, coid) {
        return this.model.updateMany(
            {
                sid: {
                    '$regex': sid,
                },

            }, {$pullAll: {coid}});
    }

    /**
     * Adds users to devices
     * @param sid: string
     * @param coid: string
     * @return Object[]
     */
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

    /**
     * Selects parents, groups and counts by type
     * @return Object[]
     */
    groupParents() {
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

    /**
     * Groups devices pre user
     * @return Object[]
     */
    groupByUsers() {
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

    /**
     * Groups devices pre user
     * @param coids: string[]
     * @return Object[]
     */
    groupByCoid(coids) {
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

