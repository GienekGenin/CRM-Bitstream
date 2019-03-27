export const users = require('express').Router();
import {usersService} from './user.service';
import {PayloadGeneratorService} from '../../common/services/payload-generator.service';

users.get('/', (req, res, next) => {
	usersService.getAll()
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

users.post('/',(req, res, next) => {
	usersService
		.save(req.body)
		.then(PayloadGeneratorService.nextWithData(next, res))
		.catch(next);
});
