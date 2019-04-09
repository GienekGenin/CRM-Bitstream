import {devicesConstants} from "../constants/index";

export const firmDevicesRequest = (firmId) => {
    return {type: devicesConstants.FIRM_DEVICES_GET_REQUEST, payload: firmId}
};

export const userDevicesRequest = (userId) => {
    return {type: devicesConstants.USER_DEVICES_GET_REQUEST, payload: userId}
};

export const cleanDevicesErrors = () => {
    return {type: devicesConstants.CLEAN_DEVICES_ERRORS}
};

export const cleanDevicesSuccess = () => {
    return {type: devicesConstants.CLEAN_DEVICES_SUCCESS}
};

export const updateDeviceUsersRequest = (sid, coid) => {
    return {type: devicesConstants.UPDATE_DEVICE_USERS_REQUEST, payload: {sid, coid}}
};

export const addDeviceRequest = (payload) => {
    return {type: devicesConstants.ADD_DEVICE_REQUEST, payload}
};

export const deleteDeviceRequest = (deviceId) => {
    return {type: devicesConstants.DELETE_DEVICE_REQUEST, payload: deviceId}
};
