import {DeviceRepository} from './devices.repository';

class DeviceService {
	private deviceRepository: DeviceRepository;

	constructor() {
		this.deviceRepository = new DeviceRepository();
	}

	getAll() {
		return this.deviceRepository.getAll();
	}

	findById(sid) {
		return this.deviceRepository.findById(sid);
	}

	save(firm) {
		return this.deviceRepository.save(firm);
	}
}

export const deviceService = new DeviceService();
