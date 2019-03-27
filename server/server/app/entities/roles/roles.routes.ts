export const roles = require('express').Router();
import {rolesService} from './roles.service';
import {PayloadGeneratorService} from '../../common/services/payload-generator.service';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

roles.get('/', TokenValidator.validateToken, (req, res, next) => {
    rolesService
        .getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

roles.get('/:id', TokenValidator.validateToken, (req, res, next) => {
    rolesService
        .findById(req.params.id)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
