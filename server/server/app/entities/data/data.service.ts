import {DataRepository} from './data.repository';
import * as async from 'async';

class DeviceTypesService {
    private dataRepository: DataRepository;

    constructor() {
        this.dataRepository = new DataRepository();
    }

    getMinMaxTime(deviceIds) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                    callback => {
                        this.dataRepository.getMinTime(deviceIds)
                            .then(data => {
                                if (data) {
                                    callback(null, {minTime: data.ts});
                                } else {
                                    callback('No minTime');
                                }
                            })
                            .catch(e => callback(e));
                    },
                    (payload, callback) => {
                        this.dataRepository.getMaxTime(deviceIds)
                            .then(data => {
                                if (data) {
                                    callback(null, Object.assign(payload, {maxTime: data.ts}))
                                } else {
                                    callback('No maxTime');
                                }
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
        }))
    }

    getData(body) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    this.dataRepository.getData(body)
                        .then(data => {
                            callback(null, data);
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

    getDevicesWithData(body) {
        return this.dataRepository.getDevicesWithData(body);
    }
}

export const dataService = new DeviceTypesService();
