import * as async from 'async';
import * as bcryptjs from 'bcryptjs';
import * as _ from 'lodash';
import {UserRepository} from './user.repository';
import {Types} from 'mongoose';
import {tokenService} from '../../common/services/request-services/token.service';
import {firmService} from '../firm/firm.service';

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

    deleteByEmail(email) {
        return new Promise(((resolve, reject) => {
            this.usersRepository.deleteByEmail(email)
                .then(d => {
                    if (d['deletedCount'] === 0) {
                        reject(new Error('Unable to delete'));
                    }
                    resolve(d);
                })
                .catch(e => reject(e));
        }));
    }

    updateByEmail(user) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                    callback => {
                        this.usersRepository.updateByEmail(user)
                            .then(d => {
                                if (d['nModified'] === 0) {
                                    callback(new Error('Unable to update'));
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
                                    password: hash
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
                                    throw new Error('User did not exist');
                                }
                                callback(null, user._doc);
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
                                if(user){
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
}

export const usersService = new UsersService();
