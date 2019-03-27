import {userSchemaService} from '../../../entities/user/user.schema';
import {validate as schemaValidationService} from '../../services/schema-validation.service';

export class UserPayloadValidator {
	static saveUser(req, res, next) {
		const errors = schemaValidationService(req.body, userSchemaService.userSchema);
		if (errors !== null) {
			return next(errors);
		}
		return next();
	}

	static loginUser(req, res, next) {
		const errors = schemaValidationService(req.body, userSchemaService.loginSchema);
		if (errors !== null) {
			return next(errors);
		}
		return next();
	}

	static changePass(req, res, next) {
		const errors = schemaValidationService(req.body, userSchemaService.changePassSchema);
		if (errors !== null) {
			return next(errors);
		}
		return next();
	}
}
