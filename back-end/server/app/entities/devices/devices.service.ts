/* tslint:disable */
import {DeviceRepository} from './devices.repository';
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

    /**
     * Groups devices pre user
     * @param device: string[]
     * @return Object[]
     */
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
                            .then(d => {
                                callback(null, d['_doc'])
                            })
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

    getDevicesByUsersArray(usersIds) {
        return this.deviceRepository.getDevicesByUsersArray(usersIds);
    }

    /**
     * Groups devices pre user
     * @param sid: string
     * @return Promise
     */
    fakeDeleteStructure(sid) {
        return new Promise(((resolve, reject) => {
            this.deviceRepository.fakeDeleteStructure(sid)
                .then(d => {
                    if (d['nModified'] === 0) {
                        reject(new Error('Unable to delete devices'));
                    }
                    resolve(null);
                })
                .catch(e => reject(e));
        }))
    }

    /**
     * Returns all devices for selected userIds
     * @param ids: string[]
     * @return Object[]
     */
    getDevicesByUserIds(ids) {
        return this.deviceRepository.getDevicesByUserIds(ids)
            .then(d => {
                return d;
            })
            .catch(e => e);
    }

    /**
     * Returns updated devices
     * @param payload: Object
     * @return Object[]
     */
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
                            return A.filter((a) => {
                                return B.indexOf(a) === -1;
                            });
                        };
                        let diffIds = [];
                        const currentCoid = device.coid.map(id => id.toString());
                        if (currentCoid.length === payload.coid.length) {
                            let diffToAdd;
                            let diffToRemove;
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
                        this.getDevicesByUserIds(payload.selectedUserIds)
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

    /**
     * Updates given device
     * @param device: Object
     * @return Object
     */
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

    getDeviceCS(body) {
        return DeviceRegistryService.getDeviceCSFromRegistry(body.sid);
    }

    changeActivity(body) {
        const sids = body.sids;
        const status = body.status;
        return DeviceRegistryService.changeActivity(sids, status);
    }

    countAllDevices() {
        return this.deviceRepository.countAll();
    }

    groupParents() {
        return this.deviceRepository.groupParents();
    }

    groupByUsers() {
        return this.deviceRepository.groupByUsers();
    }

    groupByCoid(coids) {
        return this.deviceRepository.groupByCoid(coids);
    }
}

export const deviceService = new DeviceService();
