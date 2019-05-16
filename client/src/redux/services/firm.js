import {postRequest, getRequest, deleteRequest, putRequest} from "./common";

const apiBase = process.env.REACT_APP_API_BASE;

const getAll = () => {
    const url = `${apiBase}firms`;
    return getRequest(url);
};

const addFirm = (firm) => {
    const url = `${apiBase}firms/`;
    return postRequest(url, firm);
};

const deleteFirm = (firmId) => {
    const url = `${apiBase}firms/${firmId}`;
    return deleteRequest(url, firmId);
};

const updateFirm = (payload) => {
    const url = `${apiBase}firms`;
    return putRequest(url, payload);
};

export const firmService = {
    getAll,
    addFirm,
    deleteFirm,
    updateFirm
};
