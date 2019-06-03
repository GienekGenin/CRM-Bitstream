import {DataRepository} from './data.repository';
import * as async from 'async';
import * as moment from 'moment';

class DeviceTypesService {
    private dataRepository: DataRepository;

    constructor() {
        this.dataRepository = new DataRepository();
    }

    diffInHours(minSelectedDate, maxSelectedDate) {
        const minDate = moment(new Date(minSelectedDate), 'DD/MM/YYYY HH:mm:ss:Z');
        const maxDate = moment(new Date(maxSelectedDate), 'DD/MM/YYYY HH:mm:ss:Z');
        const hours = maxDate.diff(minDate, 'hours');
        return Math.abs(hours);
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
        let diff = this.diffInHours(body.minSelectedDate, body.maxSelectedDate);
        return new Promise(((resolve, reject) => {
            if (diff > 48) {
                async.waterfall([
                    callback => {
                        this.dataRepository.countDataByDevice(body)
                            .then(counter => {
                                let zoomedIndexes = [];
                                let allIndexes = [];
                                counter.forEach(el => {
                                    if (el.count > 5000) {
                                        zoomedIndexes.push(el.sid);
                                    } else {
                                        allIndexes.push(el.sid);
                                    }
                                });
                                callback(null, allIndexes, zoomedIndexes);
                            })
                            .catch(e => callback(e));
                    },
                    async (allIndexes, zoomedIndexes, callback) => {
                        const bodyAll = Object.assign({}, body, {
                            sids: allIndexes
                        });
                        const bodyZoom = Object.assign({}, body, {
                            sids: zoomedIndexes
                        });
                        let payload = [];
                        await this.dataRepository.getAllData(bodyAll)
                            .then(d => {
                                payload = payload.concat(d);
                            })
                            .catch(e => console.log(e));
                        await this.dataRepository.getDataWithZoom(bodyZoom, 10)
                            .then(d => {
                                payload = payload.concat(d);
                            })
                            .catch(e => console.log(e));
                        callback(null, payload);
                    }
                ], (err, payload) => {
                    console.log(err, payload);
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
            } else {
                if (diff > 2) {
                    async.waterfall([
                        callback => {
                            this.dataRepository.countDataByDevice(body)
                                .then(counter => {
                                    let zoomedIndexes = [];
                                    let allIndexes = [];
                                    counter.forEach(el => {
                                        if (el.count > 5000) {
                                            zoomedIndexes.push(el.sid);
                                        } else {
                                            allIndexes.push(el.sid);
                                        }
                                    });
                                    callback(null, allIndexes, zoomedIndexes);
                                })
                                .catch(e => callback(e));
                        },
                        async (allIndexes, zoomedIndexes, callback) => {
                            const bodyAll = Object.assign({}, body, {
                                sids: allIndexes
                            });
                            const bodyZoom = Object.assign({}, body, {
                                sids: zoomedIndexes
                            });
                            let payload = [];
                            await this.dataRepository.getAllData(bodyAll)
                                .then(d => {
                                    payload = payload.concat(d);
                                })
                                .catch(e => console.log(e));
                            await this.dataRepository.getDataWithZoom(bodyZoom, 1)
                                .then(d => {
                                    payload = payload.concat(d);
                                })
                                .catch(e => console.log(e));
                            callback(null, payload);
                        }
                    ], (err, payload) => {
                        console.log(err, payload);
                        if (err) {
                            reject(err);
                        }
                        resolve(payload);
                    })
                } else {
                    this.dataRepository.getAllData(body)
                        .then(d => resolve(d))
                        .catch(e => reject(e));
                }
            }
        }))
    }

    getDevicesWithData(body) {
        return this.dataRepository.getDevicesWithData(body);
    }
}

export const dataService = new DeviceTypesService();
