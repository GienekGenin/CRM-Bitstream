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

// todo: for tests
devices.post('/structure', TokenValidator.validateToken, (req, res, next) => {
    deviceService.createStructure(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.delete('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.fakeDeleteStructure(req.body.sid)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.delete('/structure', TokenValidator.validateToken, (req, res, next) => {
    deviceService.deleteStructure(req.body.base)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.put('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.updateDevice(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.put('/users', TokenValidator.validateToken, (req, res, next) => {
    deviceService.updateDeviceUsers(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
