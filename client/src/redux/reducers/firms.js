import {firmConstants} from "../constants/index";

const initialState = {
    firms: null,
    loading: false,
    error: null,
    success: null
};

export const firmReducer = (state = initialState, action) => {
    switch (action.type) {

        case firmConstants.FIRMS_GET_REQUEST:
        case firmConstants.ADD_FIRM_REQUEST:
        case firmConstants.UPDATE_FIRM_REQUEST : {
            return {
                ...state,
                loading: true
            }
        }
        case firmConstants.ADD_FIRM_SUCCESS: {
            console.log(action.payload)
            return {
                ...state,
                firms: [...state.firms, action.payload],
                loading: false,
                success: 'Firm was successfully created'
            }
        }
        case firmConstants.FIRMS_GET_SUCCESS: {
            return Object.assign({}, state, {
                firms: action.payload,
                loading: false,
                success: 'Firms loaded successfully'
            });
        }
        case firmConstants.FIRMS_GET_FAILURE:
        case firmConstants.UPDATE_FIRM_FAILURE:
        case firmConstants.ADD_FIRM_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        case firmConstants.UPDATE_FIRM_SUCCESS: {
            return {
                ...state,
                success: action.payload
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

