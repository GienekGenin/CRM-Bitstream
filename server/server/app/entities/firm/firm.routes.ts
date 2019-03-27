export const firms = require('express').Router();
import {firmService} from './firm.service';
import {PayloadGeneratorService} from '../../common/services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

firms.get('/', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

firms.get('/:id', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .findById(req.params.id)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

firms.post('/', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .save(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
