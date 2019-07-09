import {Repository} from '../../common/repository/repository';
import {userModel} from './user.model';

export class UserRepository extends Repository {
    constructor() {
        super(userModel);
        this.model = userModel;
    }

    findByEmail(email) {
        return this.model.findOne({email});
    }

    findByFirmId(firmId) {
        return this.model.find({firm_id: firmId, deleted: {$ne: true}});
    }

    deleteByEmail(email) {
        return this.model.updateOne({email}, {deleted: true});
    }

    deleteById(id) {
        return this.model.updateOne({_id: id}, {deleted: true});
    }

    updateByEmail(user) {
        return this.model.updateOne({email: user.email}, user);
    }

    updatePass(credential) {
        return this.model.updateOne({email: credential.email}, {password: credential.password});
    }

    updateEmail(payload){
        return this.model.updateOne({email: payload.email}, {email: payload.newEmail});
    }

    groupByFirm(){
        return this.model.aggregate([
            {
                '$match': {
                    'deleted': false
                }
            }, {
                '$group': {
                    '_id': {
                        'firm_id': '$firm_id'
                    },
                    'coids': {
                        '$push': {
                            'coid': '$_id'
                        }
                    }
                }
            }, {
                '$project': {
                    '_id': 0,
                    'firm_id': '$_id.firm_id',
                    'coids': 1
                }
            }, {
                '$lookup': {
                    'from': 'firms',
                    'localField': 'firm_id',
                    'foreignField': '_id',
                    'as': 'firm'
                }
            }, {
                '$unwind': {
                    'path': '$firm'
                }
            }, {
                '$project': {
                    'coids': 1,
                    'firm_id': 1,
                    'firm_name': '$firm.name'
                }
            }
        ])
    }
}
