export const users = require('express').Router();
import {usersService} from './user.service';
import {PayloadGeneratorService} from '../../common/services/payload-generator.service';
import {UserPayloadValidator} from '../../common/middleware/request-validation/user.validator';

users.get('/', (req, res, next) => {
    usersService
        .getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.post('/', UserPayloadValidator.saveUser, (req, res, next) => {
    usersService
        .save(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.post('/login', UserPayloadValidator.loginUser, (req, res, next) => {
    usersService
        .login(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
