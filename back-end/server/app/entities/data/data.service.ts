import {DataRepository} from './data.repository';
import * as async from 'async';
import * as moment from 'moment';

class DeviceTypesService {
    private dataRepository: DataRepository;

    constructor() {
        this.dataRepository = new DataRepository();
    }

    /** diff between two dates in hours
     * Create device in IoTHub and insert it into the db
     * @param minSelectedDate: date string
     * @param maxSelectedDate: date string
     * @return number
     */
    diffInHours(minSelectedDate, maxSelectedDate) {
        const minDate = moment(new Date(minSelectedDate), 'DD/MM/YYYY HH:mm:ss:Z');
        const maxDate = moment(new Date(maxSelectedDate), 'DD/MM/YYYY HH:mm:ss:Z');
        const hours = maxDate.diff(minDate, 'hours');
        return Math.abs(hours);
    }

    /** Time for earliest and latest data records
     * Create device in IoTHub and insert it into the db
     * @param deviceIds: string[]
     * @return {minTime: string, maxTime: string}
     */
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

    /**
     * Returns docs for selected sids and time
     * @param body: Object
     * @return Object[]
     */
    getData(body) {
        const diff = this.diffInHours(body.minSelectedDate, body.maxSelectedDate);
        return new Promise(((resolve, reject) => {
            if (diff > 48) {
                async.waterfall([
                    callback => {
                        this.dataRepository.countDataByDevice(body)
                            .then(counter => {
                                const zoomedIndexes = [];
                                const allIndexes = [];
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
                                    const zoomedIndexes = [];
                                    const allIndexes = [];
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

    /**
     * Returns docs for selected sids and time
     * @param body: Object
     * @return Object[]
     */
    getDevicesWithData(body) {
        return this.dataRepository.getDevicesWithData(body);
    }

    /**
     * Returns number of docs in collection
     * @return number
     */
    countAllData() {
        return this.dataRepository.countAll();
    }

    /**
     * Counts data docs by each device
     * @param sids: stings[]
     * @return Object[]
     */
    countByDeviceIds(sids) {
        return this.dataRepository.countByDeviceIds(sids);
    }
}

export const dataService = new DeviceTypesService();
