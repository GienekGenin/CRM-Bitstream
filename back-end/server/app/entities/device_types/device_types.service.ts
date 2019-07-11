import {DeviceTypesRepository} from './device_types.repository';

class DeviceTypesService {
    private deviceTypesRepository: DeviceTypesRepository;

    constructor() {
        this.deviceTypesRepository = new DeviceTypesRepository();
    }

    getAllToUI() {
        return this.deviceTypesRepository.getAllToUI();
    }

    findById(id) {
        return this.deviceTypesRepository.findById(id);
    }
}

export const deviceTypesService = new DeviceTypesService();
