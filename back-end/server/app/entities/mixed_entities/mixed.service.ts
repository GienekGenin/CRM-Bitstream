import * as async from 'async';
import {firmService} from '../firm/firm.service';
import {usersService} from '../user/user.service';
import {deviceService} from '../devices/devices.service';
import {dataService} from '../data/data.service';
import * as _ from 'lodash';

class MixedService {

    getBasicInfo() {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    firmService.countAllFirms()
                        .then(numOfFirms => callback(null, {numOfFirms}))
                        .catch(e => callback(e));
                },
                (payload, callback) => {
                    usersService.countAllUsers()
                        .then(numOfUsers => callback(null, Object.assign(payload, {numOfUsers})))
                        .catch(e => callback(e));
                },
                (payload, callback) => {
                    deviceService.countAllDevices()
                        .then(numOfDevices => callback(null, Object.assign(payload, {numOfDevices})))
                        .catch(e => callback(e));
                },
                (payload, callback) => {
                    dataService.countAllData()
                        .then(numOfDocs => callback(null, Object.assign(payload, {numOfDocs})))
                        .catch(e => callback(e));
                }
            ], (err, payload) => {
                if (err) {
                    reject(payload);
                }
                resolve(payload);
            })
        }))
    }

    getBasicFirmInfo(firmId) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    usersService.findByFirmId(firmId)
                        .then(users => callback(null, users.map(user => ({_id: user._id, email: user.email}))))
                        .catch(e => callback(e));
                },
                (usersPayload, callback) => {
                    const coids = usersPayload.map(el => el._id);
                    deviceService.groupByCoid(coids)
                        .then(devicesPayload => {
                            const payload = [];
                            usersPayload.forEach(user => {
                                devicesPayload.forEach(device => {
                                    if (user._id.toString() === device.coid.toString()) {
                                        const devicePayload = _.omit(device, ['coid']);
                                        const userPayload = _.omit(user, ['_id']);
                                        payload.push(Object.assign(userPayload, devicePayload));
                                    }
                                })
                            });
                            callback(null, payload);
                        })
                        .catch(e => callback(e));
                }
            ], (err, payload) => {
                if (err) {
                    reject(err);
                }
                resolve(payload);
            })
        }))
    }
}

export const mixedService = new MixedService();
