import {users as usersRouter} from '../entities/user/user.routes';
import {roles as rolesRouter} from '../entities/roles/roles.routes';
import {firms as firmsRouter} from '../entities/firm/firm.routes';
import {devices as devicesRouter} from '../entities/devices/devices.routes';
import {deviceTypes as deviceTypesRouter} from '../entities/device_types/device_types.routes';
import {data as dataRouter} from "../entities/data/data.routes";

export const initializeAPIRoutes = app => {
	app.use('/api/users', usersRouter);
	app.use('/api/roles', rolesRouter);
	app.use('/api/firms', firmsRouter);
	app.use('/api/devices', devicesRouter);
	app.use('/api/device-types', deviceTypesRouter);
	app.use('/api/data', dataRouter);
};
