import {DeviceRepository} from './devices.repository';

class DeviceService {
	private deviceRepository: DeviceRepository;

	constructor() {
		this.deviceRepository = new DeviceRepository();
	}

	getAll() {
		return this.deviceRepository.getAll();
	}

	getById(id) {
		return this.deviceRepository.getById(id);
	}

	save(device) {
		return this.deviceRepository.save(device);
	}
}

export const deviceService = new DeviceService();
