export const firms = require('express').Router();
import {firmService} from './firm.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

firms.get('/', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

firms.get('/devices/:firmId', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .getFirmDevices(req.params.firmId)
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

firms.delete('/:id', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .removeById(req.params.id)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

firms.put('/', TokenValidator.validateToken, (req, res, next) => {
    firmService
        .updateById(req.body._id, req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
