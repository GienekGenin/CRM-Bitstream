import {devicesConstants} from '../constants/index';
import {devicesService} from '../services/devices';
import {errorParser} from '../../services/http.service';

export const devicesMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
            if (action.type === devicesConstants.USER_DEVICES_GET_REQUEST) {
                devicesService.getUserDevices(action.payload)
                    .then(devices => {
                        return dispatch({type: devicesConstants.USER_DEVICES_GET_SUCCESS, payload: devices})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.USER_DEVICES_GET_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === devicesConstants.ADD_FIRM_DEVICE_REQUEST) {
                devicesService.addDevice(action.payload)
                    .then(device => {
                        return dispatch({
                            type: devicesConstants.ADD_FIRM_DEVICE_SUCCESS, payload: {
                                device,
                                success: 'Device was successfully created'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.ADD_DEVICE_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === devicesConstants.DELETE_FIRM_DEVICE_REQUEST) {
                devicesService.deleteDevice(action.payload)
                    .then(() => {
                        return dispatch({type: devicesConstants.DELETE_FIRM_DEVICE_SUCCESS, payload: action.payload})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.DELETE_DEVICE_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === devicesConstants.UPDATE_DEVICE_USERS_REQUEST) {
                devicesService.updateDeviceUsers(action.payload)
                    .then(devices => {
                        return dispatch({type: devicesConstants.UPDATE_DEVICE_USERS_SUCCESS, payload: devices})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.UPDATE_DEVICE_USERS_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === devicesConstants.UPDATE_FIRM_DEVICE_REQUEST) {
                devicesService.updateDevice(action.payload)
                    .then(device => {
                        return dispatch({type: devicesConstants.UPDATE_FIRM_DEVICE_SUCCESS, payload: device})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.UPDATE_FIRM_DEVICE_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
