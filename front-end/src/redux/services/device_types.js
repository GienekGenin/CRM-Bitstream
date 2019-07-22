import {getRequest} from '../../services/http.service';

const apiBase = process.env.REACT_APP_API_BASE;

const getDeviceTypes = () => {
    const url = `${apiBase}device-types`;
    return getRequest(url);
};

export const deviceTypesService = {
    getDeviceTypes
};
