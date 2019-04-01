import {FirmRepository} from './firm.repository';
import {Types} from 'mongoose';
import * as async from 'async';

class FirmService {
    private firmRepository: FirmRepository;

    constructor() {
        this.firmRepository = new FirmRepository();
    }

    getAll() {
        return this.firmRepository.getAll();
    }

    findById(id: Types.ObjectId) {
        return this.firmRepository.findById(id);
    }

    removeById(id) {
        return new Promise(((resolve, reject) => {
            this.firmRepository.removeById(id)
                .then(d => {
                    if (d['deletedCount'] === 0) {
                        reject(new Error('Unable to delete'));
                    }
                    resolve(d);
                })
                .catch(e => reject(e));
        }))
    }

    updateById(id, obj) {
        return new Promise(((resolve, reject) => {
            async.waterfall([
                callback => {
                    this.firmRepository.update(id, obj)
                        .then(d => {
                            if (d['nModified'] === 0) {
                                callback(new Error('Unable to update'));
                            }
                            callback(null);
                        })
                        .catch(e => callback(e));
                },
                callback => {
                    this.firmRepository.findById(id)
                        .then(firm => callback(null, firm))
                        .catch(e => callback(e));
                }
            ], (err, payload) => {
                if (err) {
                    reject(err);
                }
                resolve(payload);
            })
        }))
    }

    save(firm) {
        return this.firmRepository.save(firm);
    }

}

export const firmService = new FirmService();
