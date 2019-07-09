import {getRequest, postRequest} from "./common";

const apiBase = process.env.REACT_APP_API_BASE;

const getBasicInfo = () => {
    const url = `${apiBase}mixed/basic-info`;
    return getRequest(url);
};
const getBasicFirmInfo = (firm_id) => {
    const url = `${apiBase}mixed/basic-firm-info`;
    return postRequest(url, {firm_id});
};

export const mixedService = {
    getBasicInfo,
    getBasicFirmInfo
};
