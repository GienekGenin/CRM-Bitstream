export const users = require('express').Router();
import {usersService} from './user.service';

users.get('/', (req, res, next) => {
	usersService.getAll()
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

users.post('/', (req, res, next) => {
	usersService.save(req.body)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});
