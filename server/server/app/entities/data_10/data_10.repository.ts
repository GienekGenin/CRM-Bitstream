import {Repository} from '../../common/repository/repository';
import {data_10Model} from './data_10.model';

export class Data_10Repository extends Repository {
    constructor() {
        super(data_10Model);
        this.model = data_10Model;
    }
}
