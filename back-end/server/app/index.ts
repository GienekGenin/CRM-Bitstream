import * as express from 'express';
import * as cors from 'cors';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import * as path from 'path';
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

const getRoot = () => {
    const url = process.cwd().split('\\');
    url.pop();
    return url.join('/');
};
console.log(path.join(getRoot(), 'front-end/build'));
console.log(path.join(getRoot(), 'front-end/build', 'index.html'));
app.use(express.static(path.join(getRoot(), 'front-end/build')));

app.get('/', (req, res) => {
	res.sendFile(path.join(getRoot(), 'front-end/build', 'index.html'));
});

app.use(helmet());

// pre-sending middleware
app.use(successOrEmptyPayload);

// error handler
app.use(errorPayload);

app.get('/express_backend', (req, res) => {
    res.send({express: 'EXPRESS BACKEND IS CONNECTED TO REACT'});
});
