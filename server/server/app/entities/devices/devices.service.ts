import {DeviceRepository} from './devices.repository';
import * as _ from 'lodash';
import {Types} from 'mongoose';
import * as async from 'async';
import {DeviceRegistryService} from '../../common/services/azure-services/device.registry.service';
import {deviceTypesService} from '../device_types/device_types.service';

class DeviceService {
    private deviceRepository: DeviceRepository;

    constructor() {
        this.deviceRepository = new DeviceRepository();
    }

    getAll() {
        return this.deviceRepository.getAll();
    }

    findById(id) {
        return this.deviceRepository.findById(id);
    }

    findBySid(sid) {
        return this.deviceRepository.findBySid(sid);
    }

    validateBySid(sid) {
        if (sid === '0') {
            return Promise.resolve(true);
        }
        return deviceService.findBySid(sid);
    }

    save(device) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        deviceTypesService.findById(device.type)
                            .then(deviceType => {
                                const id = Types.ObjectId();
                                const deviceToDb = Object.assign(
                                    deviceType.params,
                                    device,
                                    {
                                        _id: id,
                                        sid: deviceType.base + id
                                    });
                                callback(null, deviceToDb);
                            })
                            .catch(e => callback(e));
                    },
                    (deviceToDb, callback) => {
                        DeviceRegistryService.createDevice(deviceToDb.sid)
                            .then(() => callback(null, deviceToDb))
                            .catch(e => callback(e));
                    },
                    (deviceToDb, callback) => {
                        this.deviceRepository.save(deviceToDb)
                            .then(d => callback(null, d['_doc']))
                            .catch(err => {
                                DeviceRegistryService.deleteDevice(deviceToDb.sid)
                                    .then(() => callback('Unable to create device, try again later'))
                                    .catch(e => callback(`DB error: ${err}, Azure delete error: ${e}`));
                            });
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        })
    }

    // todo: for tests
    createDataSource(device) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        this.findBySid(device.parent_id)
                            .then(d => {
                                if (d) {
                                    return callback(null, d.lvl);
                                }
                                callback(new Error('Parent device not found'));
                            })
                            .catch(e => {
                                callback(e);
                            });
                    },
                    (parentLvl, callback) => {
                        const source = Object.assign({}, device, {lvl: parentLvl + 1});
                        this.deviceRepository.save(source)
                            .then(d => callback(null, d))
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        })
    }

    getDevicesByUsersArray(usersIds) {
        return this.deviceRepository.getDevicesByUsersArray(usersIds);
    }

    // todo: true delete from db and azure
    deleteParent(sid) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        DeviceRegistryService.deleteDevice(sid)
                            .then(() => callback(null))
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.deviceRepository.deleteParent(sid)
                            .then(d => {
                                if (d['deletedCount'] === 0) {
                                    callback(new Error(`CosmosDB error: Unable to delete ${sid}`));
                                }
                                callback(null, `${sid} was deleted`);
                            })
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        })
    }

    fakeDeleteStructure(sid) {
        return new Promise(((resolve, reject) => {
            this.deviceRepository.fakeDeleteStructure(sid)
                .then(d => {
                    console.log(d);
                    if (d['nModified'] === 0) {
                        reject(new Error('Unable to delete devices'));
                    }
                    resolve(null);
                })
                .catch(e => reject(e));
        }))
    }

    getDevicesByUserIds(ids) {
        return this.deviceRepository.getDevicesByUserIds(ids);
    }

    createStructure(structure) {
        return this.deviceRepository.createStructure(structure);
    }

    deleteStructure(base) {
        return this.deviceRepository.deleteStructure(base);
    }

    // updateDeviceUsers(payload){
    //     return this.deviceRepository.updateDeviceUsers(payload.sid, payload.coid);
    // }

    updateDeviceUsers(payload) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        this.deviceRepository.findBySid(payload.sid)
                            .then(data => callback(null, data._doc))
                            .catch(e => callback(e));
                    },
                    (device, callback) => {
                        const diff = (A, B) => {
                            return A.filter(function (a) {
                                return B.indexOf(a) == -1;
                            });
                        };
                        let diffIds = [];
                        let currentCoid = device.coid.map(id => id.toString());
                        if (currentCoid.length === payload.coid.length) {
                            let diffToAdd, diffToRemove;
                            diffToAdd = diff(payload.coid, currentCoid);
                            diffToRemove = diff(currentCoid, payload.coid);
                            diffToAdd.forEach((el, i, arr) => arr[i] = Types.ObjectId(el));
                            diffToRemove.forEach((el, i, arr) => arr[i] = Types.ObjectId(el));
                            Promise.all([
                                this.deviceRepository.updateAddDeviceUsers(payload.sid, diffToAdd),
                                this.deviceRepository.updateRemoveDeviceUsers(payload.sid, diffToRemove)
                            ])
                                .then(d => callback(null, d))
                                .catch(e => callback(e));
                        } else if (currentCoid.length < payload.coid.length) {
                            diffIds = diff(payload.coid, currentCoid);
                            this.deviceRepository.updateAddDeviceUsers(payload.sid, diffIds)
                                .then(d => callback(null, payload.sid))
                                .catch(e => callback(e));
                        } else if (currentCoid.length > payload.coid.length) {
                            diffIds = diff(currentCoid, payload.coid);
                            this.deviceRepository.updateRemoveDeviceUsers(payload.sid, diffIds)
                                .then(d => callback(null, payload.sid))
                                .catch(e => callback(e));
                        }
                    },
                    (sid, callback) => {
                        this.deviceRepository.findAllBySid(sid)
                            .then(d => callback(null, d))
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        })
    }

    updateDevice(device) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                    callback => {
                        this.deviceRepository.updateDevice(device)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to update device'));
                                }
                                callback(null);
                            })
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.deviceRepository.findById(device._id)
                            .then(dbDevice => callback(null, dbDevice._doc))
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(payload)
                })
        }))
    }

    replaceUserForDevices(parentId, adminId) {
        return this.deviceRepository.replaceUserForDevices(parentId, adminId);
    }

    getDeviceCS(body){
        return DeviceRegistryService.getDeviceCSFromRegistry(body.sid);
    }
}

export const deviceService = new DeviceService();
