export const devices = require('express').Router();
import {deviceService} from './devices.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

devices.get('/group-all', TokenValidator.validateToken, (req, res, next) => {
    deviceService.groupParents()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.post('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.save(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.post('/key', TokenValidator.validateToken, (req, res, next) => {
    deviceService.getDeviceCS(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

devices.post('/activity', TokenValidator.validateToken, (req, res, next) => {
    deviceService.changeActivity(req.body)
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

devices.delete('/', TokenValidator.validateToken, (req, res, next) => {
    deviceService.fakeDeleteStructure(req.body.sid)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
