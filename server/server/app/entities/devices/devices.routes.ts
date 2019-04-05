export const devices = require('express').Router();
import {deviceService} from './devices.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

devices.get('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.get('/:id', TokenValidator.validateToken, (req, res, next) => {
    deviceService.findById(req.params.id)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.post('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.save(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

// todo: test api for creating data sources
devices.post('/source', TokenValidator.validateToken, (req, res, next) => {
    deviceService.createDataSource(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.delete('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.deleteParent(req.body.sid)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
