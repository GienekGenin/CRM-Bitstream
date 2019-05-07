export const data = require('express').Router();
import {dataService} from './data.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

data.post('/time', TokenValidator.validateToken, (req, res, next) => {
    dataService.getMinMaxTime(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

data.post('/selected', TokenValidator.validateToken, (req, res, next) => {
    dataService.getData(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

data.post('/selected/withData', TokenValidator.validateToken, (req, res, next) => {
    dataService.getDevicesWithData(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
