export const deviceTypes = require('express').Router();
import {deviceTypesService} from './device_types.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

deviceTypes.get('/', TokenValidator.validateToken, (req, res, next) => {
    deviceTypesService.getAllToUI()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

