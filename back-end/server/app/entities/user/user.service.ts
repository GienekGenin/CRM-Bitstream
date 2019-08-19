/* tslint:disable */
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

    findById(id: Types.ObjectId) {
        return this.usersRepository.findById(id);
    }

    findByFirmId(id) {
        return this.usersRepository.findByFirmId(id);
    }

    /**
     * Removes user and assigns his devices to another user
     * @param payload: Object
     * @return Object
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

    /**
     * Updates user
     * @param user: Object
     * @return Object
     */
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

    /**
     * Saves user
     * @param user: Object
     * @return Object
     */
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

    /**
     * Checks access for a user
     * @param userCredentials: Object
     * @return Object
     */
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

    /**
     * Changes pass for user
     * @param credential: Object
     * @return Object
     */
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

    /**
     * Changes email for user
     * @param payload: Object
     * @return Object
     */
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

    /**
     * Returns user devices
     * @param id: Object
     * @return Object[]
     */
    getDevicesByUserIds(id) {
        return deviceService.getDevicesByUserIds(id)
            .then(devices => {
                const sids = devices.map(el => el.sid);
                let devicesToUI = [];
                return DeviceRegistryService.getActivity(sids)
                    .then((twins:any) => {
                        // tslint:disable-next-line
                        for (const twinsKey in twins) {
                            devices.forEach(device => {
                                if (device._doc.sid === twins[twinsKey]['deviceId']) {
                                    devicesToUI.push(Object.assign({}, device._doc,
                                        {azure: twins[twinsKey]['status']}))
                                }
                            })
                        }
                        const children = devices.filter(el => el.parent_id !== '0');
                        devicesToUI = devicesToUI.concat(children);
                        return devicesToUI;
                    });
            })
    }

    countAllUsers() {
        return this.usersRepository.countAll();
    }

    /**
     * Returns info about every firm
     * @return Object[]
     */
    infoByFirm() {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    this.usersRepository.groupByFirm()
                        .then(usersGroupedByFirm => {
                            const payload = [];
                            usersGroupedByFirm.forEach(firm => {
                                payload.push({
                                    coids: firm.coids.map(el => el.coid.toString()),
                                    firm_id: firm.firm_id,
                                    firm_name: firm.firm_name
                                });
                            });
                            callback(null, payload)
                        })
                        .catch(e => callback(e));
                },
                (groupedUsers, callback) => {
                    const payload = [];
                    deviceService.groupByUsers()
                        .then(groupedByUsers => {
                            groupedByUsers.forEach(user => {
                                payload.push({
                                    devices: user.devices.map(device => device.sid),
                                    coid: user.coid.toString()
                                })
                            });
                            callback(null, groupedUsers, payload);
                        })
                        .catch(e => callback(e));
                },
                (groupedUsers, devicesByUsers, callback) => {
                    const payload = [];
                    groupedUsers.forEach((firm, i) => {
                        let firmDevices = [];
                        let tempPayload = null;
                        devicesByUsers.forEach(user => {
                            if (firm.coids.includes(user.coid)) {
                                firmDevices = firmDevices.concat(user.devices);
                                tempPayload = Object.assign({}, firm, {
                                    firmDevices: Array.from(new Set(firmDevices)).length,
                                    coids: firm.coids.length,
                                })
                            }
                        });
                        if (tempPayload) {
                            payload.push(tempPayload)
                        }
                    });

                    callback(null, payload)
                }
            ], (err, payload) => {
                if (err) {
                    reject(err);
                }
                resolve(payload);
            })
        }))
    }

    changePass(credentials) {
        return new Promise((resolve, reject) => {
            async.waterfall(
                [
                    callback => {
                        this.usersRepository.findByEmail(credentials.email)
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
                        bcryptjs.compare(credentials.password, payload.user.password)
                            .then(result => {
                                if (result === true) {
                                    bcryptjs.hash(credentials.newPassword, 10)
                                        .then(hash => {
                                            const newCred = _.omit(credentials, ['newPassword']);
                                            callback(null, Object.assign(newCred, {password: hash}), payload.firm);
                                        })
                                        .catch(e => callback(e));
                                } else {
                                    callback('Wrong password');
                                }
                            }).catch(e => callback(e));
                    },
                    (credential, firm, callback) => {
                        this.usersRepository.updatePass(credential)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to change password'));
                                }
                                callback(null, credential, firm);
                            })
                            .catch(e => callback(e));
                    },
                    (credential, firm, callback) => {
                        this.usersRepository.findByEmail(credential.email)
                            .then(user => {
                                const userPayload = UsersService.createUserPayload(user);
                                callback(null,
                                    tokenService.createToken({firm, user: userPayload})
                                );
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
        })
    }
}

export const usersService = new UsersService();
