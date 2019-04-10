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

// addDeviceRequest
export const addUserDeviceRequest = (payload) => {
    return {type: devicesConstants.ADD_USER_DEVICE_REQUEST, payload}
};

export const addFirmDeviceRequest = (payload) => {
    return {type: devicesConstants.ADD_FIRM_DEVICE_REQUEST, payload}
};


export const deleteUserDeviceRequest = (deviceId) => {
    return {type: devicesConstants.DELETE_USER_DEVICE_REQUEST, payload: deviceId}
};

export const deleteFirmDeviceRequest = (deviceId) => {
    return {type: devicesConstants.DELETE_FIRM_DEVICE_REQUEST, payload: deviceId}
};

export const updateUserDevice = (device) => {
    return {type: devicesConstants.UPDATE_USER_DEVICE_REQUEST, payload: device}
};
