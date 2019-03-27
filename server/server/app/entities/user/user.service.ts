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

	findById(id: Types.ObjectId) {
		return this.usersRepository.findById(id);
	}
	
	save(user) {
		return this.usersRepository.save(user);
	}
}

export const usersService = new UsersService();
