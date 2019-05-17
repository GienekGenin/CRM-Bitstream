import {Registry, Device} from 'azure-iothub';
import * as async from 'async';
import uuid = require('uuid');
import {config} from '../../../../config';

export class DeviceRegistryService {
    private static connectionString: string = config.iothub.cs;

    /**
     * Create device in iothub and insert it into the db
     * @param sid: string
     * @return Promise
     */
    static createDevice(sid: string) {
        const device = {
            deviceId: sid,
            status: 'disabled',
            authentication: {
                symmetricKey: {
                    primaryKey: new Buffer(uuid.v4()).toString('base64'),
                    secondaryKey: new Buffer(uuid.v4()).toString('base64')
                }
            }
        };
        const registry = Registry.fromConnectionString(DeviceRegistryService.connectionString);
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        registry.create(device)
                            .then(() => callback(null, device.authentication.symmetricKey.primaryKey))
                            .catch(e => callback(e));
                    }],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                });
        });
    }

    /**
     * Removes device from the iothub and from the db
     * @param deviceId: string
     * @return Promise
     */
    static deleteDevice(deviceId: string) {
        const registry = Registry.fromConnectionString(DeviceRegistryService.connectionString);
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        registry.delete(deviceId)
                            .then(() => callback(null))
                            .catch(e => callback(e));
                    }],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        });
    }

    static getDeviceCSFromRegistry(sid) {
        const registry = Registry.fromConnectionString(DeviceRegistryService.connectionString);
        return new Promise((resolve, reject) => {
            registry.get(sid)
                .then(payload => {
                    const device = payload.responseBody;
                    const key = device.authentication ? device.authentication.symmetricKey.primaryKey : '<no primary key>';
                    const CS = process.env.IOTHUB_HOST_NAME + `DeviceId=${sid};SharedAccessKey=${key}`;
                    resolve(CS);
                })
                .catch(e => reject(e));
        })
    }

    static changeActivity(sids, status) {
        const registry = Registry.fromConnectionString(DeviceRegistryService.connectionString);
        return new Promise(((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        registry.list()
                            .then((payload) => {
                                const devices: Device[] = payload.responseBody;
                                const devicesToUpdate = devices
                                    .filter(el => sids.includes(el.deviceId))
                                    .map(el => Object.assign({}, el, {status}));
                                callback(null, devicesToUpdate);
                            })
                            .catch(e => callback(e));
                    },
                    (updateDevicesArr, callback) => {
                        registry.updateDevices(updateDevicesArr, true)
                            .then(d => {
                                if (d.responseBody.errors.length > 0) {
                                    callback(d.responseBody.errors);
                                }
                                callback(null, d.responseBody)
                            })
                            .catch(e => callback(e));
                    }
                ], (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                }
            )
        }))
    }

    static getActivity(sids) {
        const registry = Registry.fromConnectionString(DeviceRegistryService.connectionString);
        return new Promise(((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        registry.list()
                            .then((payload) => {
                                const devices: Device[] = payload.responseBody;
                                const devicesToUI = devices
                                    .filter(el => sids.includes(el.deviceId));
                                callback(null, devicesToUI);
                            })
                            .catch(e => callback(e));
                    }
                ], (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                }
            )
        }))
    }
}

