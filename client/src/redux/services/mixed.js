import {getRequest} from "./common";

const apiBase = process.env.REACT_APP_API_BASE;

const getBasicInfo = () => {
    const url = `${apiBase}mixed/basic-info`;
    return getRequest(url);
};

export const mixedService = {
    getBasicInfo
};
