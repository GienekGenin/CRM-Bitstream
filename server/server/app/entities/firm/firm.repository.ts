import {Repository} from '../../common/repository/repository';
import {firmModel} from './firm.model';
import {Types} from 'mongoose';

export class FirmRepository extends Repository{
	constructor(){
		super(firmModel);
		this.model = firmModel;
	}

	getFirmUsers(firmId){
		return this.model.aggregate([
			{
				'$match': {
					'_id': Types.ObjectId(firmId)
				}
			}, {
				'$lookup': {
					'from': 'users',
					'localField': '_id',
					'foreignField': 'firm_id',
					'as': 'firm_users'
				}
			}, {
				'$project': {
					'_id': 0,
					'firm_users': 1
				}
			}, {
				'$addFields': {
					'firm_users': {
						'$map': {
							'input': '$firm_users',
							'as': 'el',
							'in': '$$el._id'
						}
					}
				}
			}
		])
	}
}
