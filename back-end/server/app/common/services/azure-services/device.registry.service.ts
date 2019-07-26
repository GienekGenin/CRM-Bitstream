import {Registry, Device} from 'azure-iothub';
import * as async from 'async';
import uuid = require('uuid');
import {envVarService} from '../keyVault.service';

export class DeviceRegistryService {

    static async getCS(){
            let cs;
            if(!process.env.IOTHUB_CONNECTION_STRING){
                cs = await envVarService.setUpIoTHubCS();
            } else {
                cs = process.env.IOTHUB_CONNECTION_STRING;
            }
            return cs;
    }

    static async getHostName(){
        let host;
        if(!process.env.IOTHUB_HOST_NAME){
            host = await envVarService.setUpIoTHubHost();
        } else {
            host = process.env.IOTHUB_HOST_NAME;
        }
        return host;
    }

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
        return new Promise(async (resolve, reject) => {
            const connectionString = await DeviceRegistryService.getCS();
            const registry = Registry.fromConnectionString(connectionString);
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
     * Removes device from the IoT-Hub and from the db
     * @param deviceId: string
     * @return Promise
     */
    static deleteDevice(deviceId: string) {
        return new Promise(async (resolve, reject) => {
            const connectionString = await DeviceRegistryService.getCS();
            const registry = Registry.fromConnectionString(connectionString);
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

    /**
     * Returns devices CS from IoT-Hub
     * @param sid: string
     * @return CS: string
     */
    static getDeviceCSFromRegistry(sid) {
        return new Promise(async (resolve, reject) => {
            const connectionString = await DeviceRegistryService.getCS();
            const host = await DeviceRegistryService.getHostName();
            const registry = Registry.fromConnectionString(connectionString);
            registry.get(sid)
                .then(payload => {
                    const device = payload.responseBody;
                    const key = device.authentication ?
                        device.authentication.symmetricKey.primaryKey : '<no primary key>';
                    const CS = `${host}DeviceId=${sid};SharedAccessKey=${key}`;
                    resolve(CS);
                })
                .catch(e => reject(e));
        })
    }

    /**
     * Enables or disables devices on Azure
     * @param sids: string[]
     * @param status: string
     * @return azure success payload
     */
    static changeActivity(sids, status) {
        return new Promise((async (resolve, reject) => {
            const connectionString = await DeviceRegistryService.getCS();
            const registry = Registry.fromConnectionString(connectionString);
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

    /**
     * Enables or disables devices on Azure
     * @param sids: string[]
     * @return returns devices with activity
     */
    static getActivity(sids) {
        return new Promise((async (resolve, reject) => {
            const connectionString = await DeviceRegistryService.getCS();
            const registry = Registry.fromConnectionString(connectionString);
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

