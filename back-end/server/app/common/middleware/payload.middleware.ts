import {PayloadGeneratorService} from '../services/request-services/payload-generator.service';

export const successOrEmptyPayload = (req, res, next) => {
    const payload = PayloadGeneratorService.getResponsePayload(res);
    if (payload) {
        res.json(payload);
        res.end();
    } else {
        const err = new Error('Not Found');
        next(err);
    }
};

export const errorPayload = (err, req, res, next) => {
    res.status(err.status || 500).json(
        PayloadGeneratorService.generateFailure(err)
    );
    next();
};
