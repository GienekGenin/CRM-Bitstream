import {postRequest, getRequest, deleteRequest, putRequest} from '../../services/http.service';

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

const firmsInfo = () => {
    const url = `${apiBase}users/info-firm`;
    return getRequest(url);
};

export const firmService = {
    getAll,
    addFirm,
    deleteFirm,
    updateFirm,
    firmsInfo
};
