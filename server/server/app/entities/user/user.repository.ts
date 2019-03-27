import {Repository} from '../../common/repository/repository';
import {userModel} from './user.model';

export class UserRepository extends Repository{

	constructor(){
		super(userModel);
		this.model = userModel;
	}

}
