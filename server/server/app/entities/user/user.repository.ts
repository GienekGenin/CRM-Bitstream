import {Repository} from '../../common/repository/repository';
import {userModel} from './user.model';

export class UserRepository extends Repository {
    constructor() {
        super(userModel);
        this.model = userModel;
    }

    findByEmail(email) {
        return this.model.findOne({email}).select({_id: 0});
    }

    findByFirmId(firmId) {
        return this.model.find({firm_id: firmId}).select({_id: 0});
    }

    deleteByEmail(email) {
        return this.model.deleteOne({email});
    }

    updateByEmail(user) {
        return this.model.updateOne({email: user.email}, user);
    }
}
