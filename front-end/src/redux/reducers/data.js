import {dataConstants} from "../constants/index";

const initialState = {
    time: null,
    data: [],
    loading: false,
    error: null,
    success: null
};

export const dataReducer = (state = initialState, action) => {
    switch (action.type) {

        case dataConstants.DATA_GET_REQUEST:
        case dataConstants.TIME_GET_REQUEST: {
            return Object.assign({}, state, {
                ...state,
                loading: true
            });
        }
        case dataConstants.TIME_GET_REQUEST_SUCCESS: {
            const time = action.payload;
            return {
                ...state,
                time,
                loading: false
            }
        }
        case dataConstants.DATA_GET_REQUEST_SUCCESS: {
            return {
                ...state,
                data: action.payload,
                loading: false,
                success: 'Data loaded successfully'
            }
        }
        case dataConstants.DATA_GET_REQUEST_FAILURE:
        case dataConstants.TIME_GET_REQUEST_FAILURE: {
            return {
                ...state,
                data: [],
                time: null,
                loading: false,
                error: action.payload
            }
        }
        case dataConstants.CLEAN_DATA_SUCCESS: {
            return {
                ...state,
                success: null
            }
        }
        case dataConstants.CLEAN_DATA_ERRORS: {
            return {
                ...state,
                error: null
            }
        }
        default:
            return state;
    }
};
