import {FirmRepository} from './firm.repository';

class FirmService {
	private firmRepository: FirmRepository;

	constructor() {
		this.firmRepository = new FirmRepository();
	}

	getAll() {
		return this.firmRepository.getAll();
	}

	getById(id) {
		return this.firmRepository.getById(id);
	}

	save(firm) {
		return this.firmRepository.save(firm);
	}
}

export const firmService = new FirmService();
