import {userConstants} from "../constants/index";

const initialState = {
    users: null,
    loading: false,
    error: null,
    success: null
};

export const userReducer = (state = initialState, action) => {
    switch (action.type) {

        case userConstants.USERS_GET_REQUEST:
        case userConstants.ADD_USER_REQUEST:
        case userConstants.UPDATE_USER_REQUEST:
        case userConstants.DELETE_USER_REQUEST:
        case userConstants.CHANGE_PASS_ADMIN_REQUEST:
        case userConstants.CHANGE_EMAIL_ADMIN_REQUEST: {
            return {
                ...state,
                loading: true
            }
        }
        case userConstants.ADD_USER_SUCCESS: {
            return {
                ...state,
                users: [...state.users, action.payload.user],
                loading: false,
                success: action.payload.success
            }
        }
        case userConstants.UPDATE_USER_SUCCESS:
        case userConstants.CHANGE_PASS_ADMIN_SUCCESS: {
            return {
                ...state,
                users: state.users.map(el => (el.email === action.payload.user.email) ? action.payload.user : el),
                loading: false,
                success: action.payload.success
            }
        }
        case userConstants.CHANGE_EMAIL_ADMIN_SUCCESS: {
            return {
                ...state,
                users: state.users.map(el => (el.email === action.payload.oldEmail) ? action.payload.user : el),
                loading: false,
                success: action.payload.success
            }
        }
        case userConstants.DELETE_USER_SUCCESS: {
            return {
                users: state.users.filter(el => el.email !== action.payload),
                loading: false,
                success: 'User was successfully deleted'
            }
        }
        case userConstants.USERS_GET_SUCCESS: {
            return Object.assign({}, state, {
                users: action.payload,
                loading: false,
                success: 'Users loaded successfully'
            });
        }
        case userConstants.USERS_GET_FAILURE:
        case userConstants.UPDATE_USER_FAILURE:
        case userConstants.ADD_USER_FAILURE:
        case userConstants.DELETE_USER_FAILURE:
        case userConstants.CHANGE_PASS_ADMIN_FAILURE:
        case userConstants.CHANGE_EMAIL_ADMIN_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        case userConstants.CLEAN_USERS_ERRORS: {
            return {
                ...state,
                error: null
            }
        }
        case userConstants.CLEAN_USERS_SUCCESS: {
            return {
                ...state,
                success: null
            }
        }
        default:
            return state;
    }
};

