export const devices = require('express').Router();
import {deviceService} from './devices.service';

devices.get('/', (req, res, next) => {
	deviceService.getAll()
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

devices.get('/:id', (req, res, next) => {
	deviceService.findById(req.params.id)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});

devices.post('/', (req, res, next) => {
	deviceService.save(req.body)
		.then(d=>res.json(d))
		.catch(e=>console.log(e));
});
