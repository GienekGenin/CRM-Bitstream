import {Data_10Repository} from './data_10.repository';

class Device_10Service {
    private data_10Repository: Data_10Repository;

    constructor() {
        this.data_10Repository = new Data_10Repository();
    }

    getData() {
        return this.data_10Repository.getAll();
    }

    save(body) {
        return this.data_10Repository.save(body);
    }
}

export const data_10Service = new Device_10Service();
