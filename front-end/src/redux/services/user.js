import {getRequest, postRequest, deleteRequest, putRequest} from "../../services/http.service";

const apiBase = process.env.REACT_APP_API_BASE;

const getAllByFirmId = (firmId) => {
    const url = `${apiBase}users/firm/${firmId}`;
    return getRequest(url);
};

const addUser = (user) => {
    const url = `${apiBase}users/`;
    return postRequest(url, user);
};

const deleteUser = (payload) => {
    const url = `${apiBase}users`;
    return deleteRequest(url, payload);
};

const updateUser = (payload) => {
    const url = `${apiBase}users`;
    return putRequest(url, payload);
};

const changePassAdmin = (credentials) => {
    const url = `${apiBase}users/changePassAdmin`;
    return putRequest(url, credentials);
};

const changeEmailAdmin = (payload) => {
    const url = `${apiBase}users/changeEmailAdmin`;
    return putRequest(url, payload);
};

export const userService = {
    getAllByFirmId,
    addUser,
    deleteUser,
    updateUser,
    changePassAdmin,
    changeEmailAdmin
};
