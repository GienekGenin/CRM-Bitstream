import {Repository} from '../../common/repository/repository';
import {firmModel} from './firm.model';

export class FirmRepository extends Repository{

	constructor(){
		super(firmModel);
		this.model = firmModel;
	}

}
