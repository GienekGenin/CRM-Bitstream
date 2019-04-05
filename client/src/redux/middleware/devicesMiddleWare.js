import {devicesConstants} from '../constants/index';
import {devicesService} from "../services/devices";

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};

export const devicesMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
            if (action.type === devicesConstants.FIRM_DEVICES_GET_REQUEST) {
                devicesService.getFirmDevices(action.payload)
                    .then(devices => {
                        return dispatch({type: devicesConstants.FIRM_DEVICES_GET_SUCCESS, payload: devices})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.FIRM_DEVICES_GET_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === devicesConstants.USER_DEVICES_GET_REQUEST) {
                devicesService.getUserDevices(action.payload)
                    .then(devices => {
                        return dispatch({type: devicesConstants.USER_DEVICES_GET_SUCCESS, payload: devices})
                    })
                    .catch(err => {
                        dispatch({type: devicesConstants.USER_DEVICES_GET_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
