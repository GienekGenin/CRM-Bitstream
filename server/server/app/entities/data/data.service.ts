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
                                if(data){
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
                                if(data){
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

    getData(body){
        return this.dataRepository.getData(body);
    }
}

export const dataService = new DeviceTypesService();
