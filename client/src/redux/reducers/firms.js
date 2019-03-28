import {firmConstants} from "../constants/index";

const initialState = {
    firms: null,
    loading: false,
    error: null
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
                loading: false
            });
        }
        case firmConstants.FIRMS_GET_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        default:
            return state;
    }
};

