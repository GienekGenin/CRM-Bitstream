import {UserRepository} from './user.repository';
import {Types} from 'mongoose';

class UsersService {
	private usersRepository: UserRepository;

	constructor() {
		this.usersRepository = new UserRepository();
	}

	getAll() {
		return this.usersRepository.getAll();
	}

	getById(id: Types.ObjectId) {
		return this.usersRepository.getById(id);
	}
	
	save(user) {
		return this.usersRepository.save(user);
	}
}

export const usersService = new UsersService();
