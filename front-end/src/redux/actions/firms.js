import {firmConstants} from '../constants/index';

export const firmsRequest = () => {
    return {type: firmConstants.FIRMS_GET_REQUEST}
};

export const cleanFirmsErrors = () => {
    return {type: firmConstants.CLEAN_FIRMS_ERRORS}
};

export const cleanFirmsSuccess = () => {
    return {type: firmConstants.CLEAN_FIRMS_SUCCESS}
};

export const updateFirmRequest = (firm) => {
    return {type: firmConstants.UPDATE_FIRM_REQUEST, payload: firm}
};

export const addFirmRequest = (payload) => {
    return {type: firmConstants.ADD_FIRM_REQUEST, payload}
};

export const deleteFirmRequest = (firmId) => {
    return {type: firmConstants.DELETE_FIRM_REQUEST, payload: firmId}
};
