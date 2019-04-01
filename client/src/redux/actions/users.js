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

export const deleteUserRequest = (userId) => {
    return {type: userConstants.DELETE_USER_REQUEST, payload: userId}
};
