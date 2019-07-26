import {app} from '../app';
import * as http from 'http';
import {config} from '../config';
import {dbConnectionService} from '../db/connect';
import {socketService} from '../app/common/services/socket.service';
import {envVarService} from '../app/common/services/keyVault.service';

/**
 * Setup an express server and define port to listen all incoming requests for this application
 */
const setUpExpress = async () => {
    await envVarService.setUpEnvVars();
    dbConnectionService.connect();
    const port = normalizePort(config.server.port || '5000');
    app.set('port', port);

    const server = http.createServer(app);

    /**
     * Event listener for HTTP server "error" event.
     */
    const onError = error => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string'
            ? `Pipe ${port}`
            : `Port ${port}`;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    };

    /**
     * Event listener for HTTP server "listening" event.
     */
    const onListening = () => {
        const addr = server.address();
        const bind = typeof addr === 'string'
            ? `pipe ${addr}`
            : `port ${addr.port}`;
        console.log(`Listening on ${bind}`);
    };

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    socketService(server);

    function normalizePort(val) {
        const port = parseInt(val, 10);

        if (isNaN(port)) {
            // named pipe
            return val;
        }

        if (port >= 0) {
            // port number
            return port;
        }

        return false;
    }
};

setUpExpress();

export {app};
