export const firms = require('express').Router();
import {firmService} from './firm.service';

firms.get('/', (req, res, next) => {
	firmService.getAll()
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

firms.get('/:id', (req, res, next) => {
	firmService.getById(req.params.id)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

firms.post('/', (req, res, next) => {
	firmService.save(req.body)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});
