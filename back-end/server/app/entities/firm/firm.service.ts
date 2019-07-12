import {FirmRepository} from './firm.repository';
import {Types} from 'mongoose';
import * as async from 'async';
import {deviceService} from '../devices/devices.service';

class FirmService {
    private firmRepository: FirmRepository;

    constructor() {
        this.firmRepository = new FirmRepository();
    }

    getAll() {
        return this.firmRepository.getAll();
    }

    findById(id: Types.ObjectId) {
        return this.firmRepository.findById(id);
    }

    /**
     * removes firm by firmId
     * @param id: string
     * @return Object
     */
    removeById(id) {
        return new Promise(((resolve, reject) => {
            this.firmRepository.removeById(id)
                .then(d => {
                    if (d['deletedCount'] === 0) {
                        reject(new Error('Unable to delete'));
                    }
                    resolve(d);
                })
                .catch(e => reject(e));
        }))
    }

    /**
     * removes firm by firmId
     * @param id: string
     * @param firm: Object
     * @return Object[]
     */
    updateById(id, firm) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    this.firmRepository.update(id, firm)
                        .then(d => {
                            if (d['nModified'] === 0) {
                                callback(new Error('Unable to update'));
                            }
                            callback(null);
                        })
                        .catch(e => callback(e));
                },
                callback => {
                    this.firmRepository.findById(id)
                        .then(firm => callback(null, firm))
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

    save(firm) {
        return this.firmRepository.save(firm);
    }

    /**
     * Returns firm devices
     * @param firmId: string
     * @return Object[]
     */
    getFirmDevices(firmId) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    this.firmRepository.getFirmUsers(firmId)
                        .then(d => {
                            if (!(d[0].firm_users)) {
                                callback(new Error('Firm has no users'));
                            } else {
                                callback(null, d[0].firm_users)
                            }
                        })
                        .catch(e => callback(e));
                },
                (usersIds, callback) => {
                    deviceService.getDevicesByUsersArray(usersIds)
                        .then(d => callback(null, d))
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

    /**
     * Counts all firms
     * @return Object[]
     */
    countAllFirms() {
        return this.firmRepository.countAll();
    }
}

export const firmService = new FirmService();
