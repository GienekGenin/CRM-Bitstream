import {DeviceRepository} from './devices.repository';
import * as _ from 'lodash';
import {Types} from 'mongoose';
import * as async from 'async';

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

    save(device) {
        const id = Types.ObjectId();
        const deviceToDb = Object.assign({}, device, {_id: id, sid: device.base+id, lvl: 0});
        return this.deviceRepository.save(_.omit(deviceToDb,['base']));
    }

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

    getDevicesByUsersArray(usersIds){
        return this.deviceRepository.getDevicesByUsersArray(usersIds);
    }
}

export const deviceService = new DeviceService();
