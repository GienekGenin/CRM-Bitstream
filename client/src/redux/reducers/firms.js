import {firmConstants} from "../constants/index";

const initialState = {
    firms: null,
    loading: false,
    error: null,
    success: null
};

export const firmReducer = (state = initialState, action) => {
    switch (action.type) {

        case firmConstants.FIRMS_GET_REQUEST: {
            return Object.assign({}, state, {
                firms: action.payload,
                loading: true
            });
        }
        case firmConstants.FIRMS_GET_SUCCESS: {
            return Object.assign({}, state, {
                firms: action.payload,
                loading: false,
                success: 'Firms loaded successfully'
            });
        }
        case firmConstants.FIRMS_GET_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        case firmConstants.CLEAN_FIRMS_ERRORS: {
            return {
                ...state,
                error: null
            }
        }
        case firmConstants.CLEAN_FIRMS_SUCCESS: {
            return {
                ...state,
                success: null
            }
        }
        default:
            return state;
    }
};

