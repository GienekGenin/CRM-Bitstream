import {RolesRepository} from './roles.repository';
import {Types} from 'mongoose';

class RolesService {
	private rolesRepository: RolesRepository;

	constructor() {
		this.rolesRepository = new RolesRepository();
	}

	getAll() {
		return new Promise(((resolve, reject) => {
			this.rolesRepository.getAll().then(roles=>{
				const payload = [];
				roles.forEach(role=>{
					if(role._doc.name!=='Super Admin'){
						payload.push(role._doc);
					}
				});
				resolve(payload);
			}).catch(e=>(reject(e)));
		}))
	}

	findById(id: Types.ObjectId) {
		return this.rolesRepository.findById(id);
	}
	
}

export const rolesService = new RolesService();
