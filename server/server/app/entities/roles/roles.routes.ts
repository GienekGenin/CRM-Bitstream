export const roles = require('express').Router();
import {rolesService} from './roles.service';

roles.get('/', (req, res, next) => {
	rolesService.getAll()
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

roles.get('/:id', (req, res, next) => {
	rolesService.getById(req.params.id)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});
