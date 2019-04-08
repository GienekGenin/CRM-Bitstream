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

    getDevicesByUserId(id) {
        return this.deviceRepository.getDevicesByUserId(id);
    }
}

export const deviceService = new DeviceService();
