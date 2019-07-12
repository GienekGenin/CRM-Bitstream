import {Repository} from '../../common/repository/repository';
import {rolesModel} from './roles.model';

export class RolesRepository extends Repository {
    constructor() {
        super(rolesModel);
        this.model = rolesModel;
    }
}
