import {devicesConstants} from "../constants/index";

export const userDevicesRequest = (userId) => {
    return {type: devicesConstants.USER_DEVICES_GET_REQUEST, payload: userId}
};

export const cleanDevicesErrors = () => {
    return {type: devicesConstants.CLEAN_DEVICES_ERRORS}
};

export const cleanDevicesSuccess = () => {
    return {type: devicesConstants.CLEAN_DEVICES_SUCCESS}
};

/**
 *
 * @param sid
 * @param coid
 * @returns {{payload: {coid: *, sid: *}, type: string}}
 */
export const updateDeviceUsersRequest = (sid, coid, selectedUserIds) => {
    return {type: devicesConstants.UPDATE_DEVICE_USERS_REQUEST, payload: {sid, coid, selectedUserIds}}
};

export const addFirmDeviceRequest = (payload) => {
    return {type: devicesConstants.ADD_FIRM_DEVICE_REQUEST, payload}
};

export const deleteFirmDeviceRequest = (deviceId) => {
    return {type: devicesConstants.DELETE_FIRM_DEVICE_REQUEST, payload: deviceId}
};


export const updateFirmDevice = (device) => {
    return {type: devicesConstants.UPDATE_FIRM_DEVICE_REQUEST, payload: device}
};
