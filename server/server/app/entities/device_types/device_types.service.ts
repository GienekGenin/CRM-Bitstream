import {DeviceTypesRepository} from './device_types.repository';

class DeviceTypesService {
    private deviceTypesRepository: DeviceTypesRepository;

    constructor() {
        this.deviceTypesRepository = new DeviceTypesRepository();
    }

    getAll() {
        return this.deviceTypesRepository.getAll();
    }

}

export const deviceTypesService = new DeviceTypesService();
