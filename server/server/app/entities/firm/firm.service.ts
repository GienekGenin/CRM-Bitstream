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

	save(firm) {
		return this.firmRepository.save(firm);
	}
}

export const firmService = new FirmService();
