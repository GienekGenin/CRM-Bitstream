import {ErrorService} from './error.service';

export class PayloadGeneratorService {
	/**
	 * @param res - http response
	 * @param data - received payload object
	 * @return Object: payload object
	 */
	static generateSuccess(res, data) {
		return PayloadGeneratorService.setResponsePayload(res, {
			payload: data,
			isSuccess: true,
			errors: []
		});
	}

	static setResponsePayload(res, data) {
		res.locals.payload = data;
	}

	static getResponsePayload(res) {
		return res.locals.payload;
	}

	static nextWithData(next, res) {
		return data => {
			PayloadGeneratorService.generateSuccess(res, data);
			next();
		};
	}
	/**
	 * @param err - received error
	 * @return Object: payload object
	 */
	static generateFailure(err) {
		return {
			payload: null,
			isSuccess: false,
			errors: new ErrorService().createCustomError(err)
		};
	}
}



