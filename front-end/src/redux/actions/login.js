import {loginConstants} from "../constants/index";

export const loginRequest = (payload) => {
    return {type: loginConstants.LOGIN_REQUEST, payload}
};

export const logoutRequest = () => {
    return {type: loginConstants.LOGOUT_REQUEST, payload: null}
};

export const setUser = (payload) => {
    return {type: loginConstants.SET_USER, payload}
};

export const changePassRequest = (payload) => {
    return {type: loginConstants.CHANGE_PASS_REQUEST, payload}
};

export const cleanLoginErrors = () => {
    return {type: loginConstants.CLEAN_LOGIN_ERRORS}
};
