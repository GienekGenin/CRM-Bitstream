import {postRequest} from '../../services/http.service';

const apiBase = process.env.REACT_APP_API_BASE;

const getMinMaxDataTime = (deviceIds) => {
    const url = `${apiBase}data/time`;
    return postRequest(url, deviceIds);
};

const getData = (body) => {
    const url = `${apiBase}data/selected`;
    return postRequest(url, body);
};

const getDevicesWithData = (body) => {
    const url = `${apiBase}data/selected/withData`;
    return postRequest(url, body);

};

export const dataService = {
    getMinMaxDataTime,
    getData,
    getDevicesWithData
};
