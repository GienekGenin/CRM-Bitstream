import {dataConstants} from '../constants/index';

export const getMinMaxTimeRequest = (sids) => {
    return {type: dataConstants.TIME_GET_REQUEST, payload: sids}
};

export const getDataRequest = (minSelectedDate, maxSelectedDate, sids) => {
    return {type: dataConstants.DATA_GET_REQUEST, payload: {minSelectedDate, maxSelectedDate, sids}}
};

export const cleanDataErrors = () => {
    return {type: dataConstants.CLEAN_DATA_ERRORS}
};

export const cleanDataSuccess = () => {
    return {type: dataConstants.CLEAN_DATA_SUCCESS}
};
