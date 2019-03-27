import * as express from 'express';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import {initializeAPIRoutes} from './routes';

import {dbConnectionService} from '../db/connect';

export const app = express();

dbConnectionService.connect();

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json({limit: 50000000, type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());

initializeAPIRoutes(app);

app.get('/', (req, res) => {
	res.send('Hello World');
});

app.get('/express_backend', (req, res) => {
	res.send({express: 'EXPRESS BACKEND IS CONNECTED TO REACT'});
});
