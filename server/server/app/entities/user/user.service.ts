import * as async from 'async';
import * as bcryptjs from 'bcryptjs';
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
}

export const usersService = new UsersService();
