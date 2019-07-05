export const mixed = require('express').Router();
import {mixedService} from "./mixed.service";
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

mixed.get('/basic-info', TokenValidator.validateToken, (req, res, next) => {
    mixedService
        .getBasicInfo()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
