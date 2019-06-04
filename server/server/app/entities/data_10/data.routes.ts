export const data_10 = require('express').Router();
import {data_10Service} from './data.service';
import {PayloadGeneratorService} from '../../common/services/request-services/payload-generator.service';

data_10.get('/', (req, res, next) => {
    data_10Service.getData()
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});

data_10.post('/', (req, res, next) => {
    data_10Service.save(req.body)
        .then(PayloadGeneratorService.nextWithData(next, res))
        .catch(next);
});
