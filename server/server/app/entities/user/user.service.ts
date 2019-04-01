import * as async from 'async';
import * as bcryptjs from 'bcryptjs';
import * as _ from 'lodash';
import {UserRepository} from './user.repository';
import {Types} from 'mongoose';
import {tokenService} from '../../common/services/token.service';
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

    findByFirmId(id){
        return this.usersRepository.findByFirmId(id);
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
                                    callback(null, {
                                        user: userPayload,
                                        firm: payload.firm,
                                        tokenSecret: tokenService.createToken(userPayload)
                                    })
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
}

export const usersService = new UsersService();
