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

	getById(id: Types.ObjectId) {
		return this.rolesRepository.getById(id);
	}
	
}

export const rolesService = new RolesService();
