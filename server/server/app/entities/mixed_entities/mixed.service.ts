import * as async from 'async';
import {firmService} from "../firm/firm.service";
import {usersService} from "../user/user.service";
import {deviceService} from "../devices/devices.service";
import {dataService} from "../data/data.service";

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
}

export const mixedService = new MixedService();
