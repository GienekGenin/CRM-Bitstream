import {userConstants} from "../constants/index";

export const usersRequest = () => {
    return {type: userConstants.USERS_GET_REQUEST}
};

export const cleanUsersErrors = () => {
    return {type: userConstants.CLEAN_USERS_ERRORS}
};

export const cleanUsersSuccess = () => {
    return {type: userConstants.CLEAN_USERS_SUCCESS}
};

export const updateFirmRequest = (user) => {
    return {type: userConstants.UPDATE_USER_REQUEST, payload: user}
};

export const addUserRequest = (payload) => {
    return {type: userConstants.ADD_USER_REQUEST, payload}
};

export const deleteUserRequest = (userId) => {
    return {type: userConstants.DELETE_USER_REQUEST, payload: userId}
};
