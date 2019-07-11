import {RolesRepository} from './roles.repository';
import {Types} from 'mongoose';

class RolesService {
    private rolesRepository: RolesRepository;

    constructor() {
        this.rolesRepository = new RolesRepository();
    }

    getAll() {
        return this.rolesRepository.getAll();
    }

    /**
     * Returns role
     * @param id: ObjectId
     * @return Object
     */
    findById(id: Types.ObjectId) {
        return this.rolesRepository.findById(id);
    }

}

export const rolesService = new RolesService();
