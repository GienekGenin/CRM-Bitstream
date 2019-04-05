import {tokenService} from '../../services/request-services/token.service';

export class TokenValidator {
	static validateToken(req, res, next) {
		const pureToken = req.headers.authorization.replace('Bearer ', '');
		tokenService.verifyToken(pureToken).catch(e => next(e));
		return next();
	}
}
