import * as async from 'async';
import * as bcryptjs from 'bcryptjs';
import * as _ from 'lodash';
import {UserRepository} from './user.repository';
import {Types} from 'mongoose';
import {tokenService} from '../../common/services/request-services/token.service';
import {firmService} from '../firm/firm.service';
import {deviceService} from '../devices/devices.service';
import {DeviceRegistryService} from '../../common/services/azure-services/device.registry.service';

class UsersService {
    private usersRepository: UserRepository;

    constructor() {
        this.usersRepository = new UserRepository();
    }

    static createUserPayload(user) {
        return _.omit(user, ['password']);
    }

    getAll() {
        return this.usersRepository.getAll();
    }

    findById(id: Types.ObjectId) {
        return this.usersRepository.findById(id);
    }

    findByFirmId(id) {
        return this.usersRepository.findByFirmId(id);
    }

    /**
     * @param payload.id, payload.adminId
     */
    deleteById(payload) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                    callback => {
                        deviceService.replaceUserForDevices(payload.id, payload.adminId)
                            .then(() => callback(null))
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.usersRepository.deleteById(payload.id)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to delete user'));
                                }
                                callback(null, payload.id);
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
        }));
    }

    updateByEmail(user) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                    callback => {
                        this.usersRepository.updateByEmail(user)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to update user'));
                                }
                                callback(null);
                            })
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.usersRepository.findByEmail(user.email)
                            .then(user => callback(null, user))
                            .catch(e => callback(e));
                    }],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        }))
    }

    save(user) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        bcryptjs.hash(user.password, 10)
                            .then(hash => callback(null,
                                Object.assign({}, user, {
                                    password: hash,
                                    deleted: false
                                })))
                            .catch(e => callback(e));
                    },
                    (user, callback) => {
                        this.usersRepository.save(user)
                            .then(data => callback(null, data))
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

    login(userCredentials) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        this.usersRepository.findByEmail(userCredentials.email)
                            .then(user => {
                                if (user === null) {
                                    callback(new Error('User did not exist'));
                                } else if (user._doc.deleted) {
                                    callback(new Error('User did not exist'));
                                } else {
                                    callback(null, user._doc);
                                }
                            })
                            .catch(err => {
                                callback(err);
                            });
                    },
                    (user, callback) => {
                        firmService.findById(user.firm_id)
                            .then(firm => callback(null, {user, firm}))
                            .catch(e => callback(e));
                    },
                    (payload, callback) => {
                        bcryptjs.compare(userCredentials.password, payload.user.password)
                            .then(result => {
                                if (result === true) {
                                    const userPayload = UsersService.createUserPayload(payload.user);
                                    callback(null,
                                        tokenService.createToken({user: userPayload, firm: payload.firm})
                                    )
                                } else {
                                    callback('Wrong password');
                                }
                            }).catch(e => callback(e));
                    }],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                })
        })
    }

    changePassAdmin(credential) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        bcryptjs.hash(credential.password, 10)
                            .then(hash => callback(null,
                                Object.assign({}, credential, {
                                    password: hash
                                })))
                            .catch(e => callback(e));
                    },
                    (credential, callback) => {
                        this.usersRepository.updatePass(credential)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to change password'));
                                }
                                callback(null);
                            })
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.usersRepository.findByEmail(credential.email)
                            .then(user => callback(null, user))
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                });
        });
    }

    changeEmailAdmin(payload) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        this.usersRepository.findByEmail(payload.newEmail)
                            .then(user => {
                                if (user) {
                                    callback('User with such email already exists');
                                }
                                callback(null);
                            })
                            .catch(e => callback(e));
                    },
                    (callback) => {
                        this.usersRepository.updateEmail(payload)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to update'));
                                }
                                callback(null);
                            })
                            .catch(e => callback(e));
                    },
                    callback => {
                        this.usersRepository.findByEmail(payload.newEmail)
                            .then(user => callback(null, {user, oldEmail: payload.email}))
                            .catch(e => callback(e));
                    }
                ],
                (err, payload) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(payload);
                });
        });
    }

    getDevicesByUserIds(id) {
        return deviceService.getDevicesByUserIds(id)
            .then(devices => {
                const sids = devices.map(el => el.sid);
                let devicesToUI = [];
                return DeviceRegistryService.getActivity(sids)
                    .then(twins => {
                        for (let twinsKey in twins) {
                            devices.forEach(device => {
                                if (device._doc.sid === twins[twinsKey]['deviceId']) {
                                    devicesToUI.push(Object.assign({}, device._doc, {azure: twins[twinsKey]['status']}))
                                }
                            })
                        }
                        let children = devices.filter(el => el.parent_id !== '0');
                        devicesToUI = devicesToUI.concat(children);
                        return devicesToUI;
                    });

            })
    }
}

export const usersService = new UsersService();
