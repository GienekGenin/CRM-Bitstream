import {loginConstants} from "../constants/index";

const initialState = {
    user: null,
    firm: null,
    loading: false,
    error: null,
    success: null
};
export const loginReducer = (state = initialState, action) => {
    switch (action.type) {

        case loginConstants.LOGIN_SUCCESS: {
            return Object.assign({}, state, {
                user: action.payload.user,
                firm: action.payload.firm,
                loading: false
            });
        }
        case loginConstants.LOGIN_REQUEST:
        case loginConstants.CHANGE_PASS_REQUEST: {
            return Object.assign({}, state, {
                user: null,
                firm: null,
                loading: true
            });
        }
        case loginConstants.CHANGE_PASS_SUCCESS: {
            return Object.assign({}, state, {
                user: action.payload.user,
                firm: action.payload.firm,
                loading: false,
                success: action.payload.success,
            });
        }
        case loginConstants.LOGIN_FAILURE:
        case loginConstants.CHANGE_PASS_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        case loginConstants.LOGOUT_REQUEST: {
            return Object.assign({}, state, {user: null, firm: null, loading: false});
        }
        case loginConstants.SET_USER: {
            return Object.assign({}, state, {
                user: action.payload.user,
                firm: action.payload.user,
                loading: false});
        }
        case loginConstants.CLEAN_LOGIN_ERRORS: {
            return {
                ...state,
                error: null
            }
        }
        case loginConstants.CLEAN_LOGIN_SUCCESS: {
            return {
                ...state,
                success: null
            }
        }
        default:
            return state;
    }
};

