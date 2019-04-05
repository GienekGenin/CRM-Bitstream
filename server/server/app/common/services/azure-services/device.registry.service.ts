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
}

