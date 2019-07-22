import {postRequest, putRequest, deleteRequest} from '../../services/http.service';

const apiBase = process.env.REACT_APP_API_BASE;

const getUserDevices = (userIds) => {
    const url = `${apiBase}users/devices/`;
    return postRequest(url, userIds);
};

const addDevice = (device) => {
    const url = `${apiBase}devices/`;
    return postRequest(url, device);
};

const deleteDevice = (deviceId) => {
    const url = `${apiBase}devices`;
    return deleteRequest(url, {sid: deviceId});
};

const updateDeviceUsers = (payload) => {
    const url = `${apiBase}devices/users`;
    return putRequest(url, payload);
};

const updateDevice = (payload) => {
    const url = `${apiBase}devices`;
    return putRequest(url, payload);
};

const getDeviceCS = (sid) => {
    const url = `${apiBase}devices/key`;
    return postRequest(url, {sid});
};

const changeActivity = (sids, status) => {
    const url = `${apiBase}devices/activity`;
    return postRequest(url, {sids, status});
};

export const devicesService = {
    getUserDevices,
    addDevice,
    deleteDevice,
    updateDeviceUsers,
    updateDevice,
    getDeviceCS,
    changeActivity
};
