export const users = require('express').Router();
import {usersService} from './user.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';
import {UserPayloadValidator} from '../../common/middleware/request-validation/user.validator';
import {TokenValidator} from '../../common/middleware/request-validation/token.validator';

users.get('/', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .getAll()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.get('/info-firm', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .infoByFirm()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.get('/firm/:id', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .findByFirmId(req.params.id)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.post('/', TokenValidator.validateToken, UserPayloadValidator.saveUser, (req, res, next) => {
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

users.post('/devices', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .getDevicesByUserIds(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.put('/', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .updateByEmail(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.put('/changePassAdmin', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .changePassAdmin(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.put('/changeEmailAdmin', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .changeEmailAdmin(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

users.delete('/', TokenValidator.validateToken, (req, res, next) => {
    usersService
        .deleteById(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

