import {userConstants} from "../constants/index";

export const usersRequest = (firmId) => {
    return {type: userConstants.USERS_GET_REQUEST, payload: firmId}
};

export const cleanUsersErrors = () => {
    return {type: userConstants.CLEAN_USERS_ERRORS}
};

export const cleanUsersSuccess = () => {
    return {type: userConstants.CLEAN_USERS_SUCCESS}
};

export const updateUserRequest = (user) => {
    return {type: userConstants.UPDATE_USER_REQUEST, payload: user}
};

export const addUserRequest = (payload) => {
    return {type: userConstants.ADD_USER_REQUEST, payload}
};

export const deleteUserRequest = (email) => {
    return {type: userConstants.DELETE_USER_REQUEST, payload: email}
};

export const changePassAdminRequest = (credentials) => {
    return {type: userConstants.CHANGE_PASS_ADMIN_REQUEST, payload: credentials}
};

export const changeEmailAdminRequest = (email, newEmail) => {
    return {type: userConstants.CHANGE_EMAIL_ADMIN_REQUEST, payload: {email, newEmail}}
};
