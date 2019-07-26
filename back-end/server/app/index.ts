import * as express from 'express';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import {initializeAPIRoutes} from './routes';
import {
    successOrEmptyPayload,
    errorPayload
} from './common/middleware/payload.middleware';

export const app = express();

app.use(logger('dev'));
app.use(cors());

app.use(bodyParser.json({limit: 50000000, type: 'application/json'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());

initializeAPIRoutes(app);

// pre-sending middleware
app.use(successOrEmptyPayload);

// error handler
app.use(errorPayload);

app.get('/express_backend', (req, res) => {
    res.send({express: 'EXPRESS BACKEND IS CONNECTED TO REACT'});
});
