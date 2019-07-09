const socketIO = require('socket.io');
import {rolesService} from '../../entities/roles/roles.service';


export const socketService = (server) => {
	const io = socketIO(server);

	io.on('connection', socket => {
		console.log('user connected');

		socket.on('disconnect', () => {
			console.log('user disconnected')
		});

		socket.on('Server_status', (msg) => {
			console.log(msg);
			io.emit('Server_response', 'Loud and clear');
		});

		rolesService.getAll()
			.then(roles=>{
				io.emit('Roles', roles);
			})
			.catch(e=>e);
	});
};
