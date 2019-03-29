import {FirmRepository} from './firm.repository';
import {Types} from 'mongoose';

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
            this.firmRepository.update(id, obj)
                .then(d => {
                    if (d['nModified'] === 0) {
                        reject(new Error('Unable to update'));
                    }
                    resolve(d);
                })
                .catch(e => reject(e));
        }))
    }

    save(firm) {
        return this.firmRepository.save(firm);
    }
}

export const firmService = new FirmService();
