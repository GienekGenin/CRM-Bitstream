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
}
