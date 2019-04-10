import {devicesConstants} from "../constants/index";

const initialState = {
    devices: null,
    userDevices: null,
    loading: false,
    error: null,
    success: null
};

export const devicesReducer = (state = initialState, action) => {
    switch (action.type) {

        case devicesConstants.FIRM_DEVICES_GET_REQUEST:
        case devicesConstants.ADD_FIRM_DEVICE_REQUEST:
        case devicesConstants.ADD_USER_DEVICE_REQUEST:
        case devicesConstants.UPDATE_USER_DEVICE_REQUEST:
        case devicesConstants.UPDATE_FIRM_DEVICE_REQUEST:
        case devicesConstants.DELETE_USER_DEVICE_REQUEST:
        case devicesConstants.DELETE_FIRM_DEVICE_REQUEST:
        case devicesConstants.USER_DEVICES_GET_REQUEST: {
            return {
                ...state,
                loading: true
            }
        }
        case devicesConstants.ADD_USER_DEVICE_SUCCESS: {
            return {
                ...state,
                userDevices: [...state.userDevices, action.payload.device],
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.ADD_FIRM_DEVICE_SUCCESS: {
            return {
                ...state,
                devices: [...state.devices, action.payload.device],
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.UPDATE_USER_DEVICE_SUCCESS: {
            return {
                ...state,
                userDevices: state.userDevices.map(el => (el._id === action.payload._id) ? action.payload : el),
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.UPDATE_FIRM_DEVICE_SUCCESS: {
            return {
                ...state,
                devices: state.devices.map(el => (el._id === action.payload._id) ? action.payload : el),
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.DELETE_USER_DEVICE_SUCCESS: {
            return {
                ...state,
                userDevices: state.userDevices.filter(el => el.sid !== action.payload),
                loading: false,
                success: 'Device was successfully deleted'
            }
        }
        case devicesConstants.DELETE_FIRM_DEVICE_SUCCESS: {
            return {
                ...state,
                devices: state.devices.filter(el => el.sid !== action.payload),
                loading: false,
                success: 'Device was successfully deleted'
            }
        }
        case devicesConstants.FIRM_DEVICES_GET_SUCCESS: {
            return Object.assign({}, state, {
                devices: action.payload,
                loading: false,
                success: 'Devices loaded successfully'
            });
        }
        case devicesConstants.USER_DEVICES_GET_SUCCESS: {
            return Object.assign({}, state, {
                userDevices: action.payload,
                loading: false,
                success: 'User devices loaded successfully'
            });
        }
        case devicesConstants.FIRM_DEVICES_GET_FAILURE: {
            return {
                devices: null,
                loading: false,
                error: action.payload
            }
        }
        case devicesConstants.UPDATE_USER_DEVICE_FAILURE:
        case devicesConstants.UPDATE_FIRM_DEVICE_FAILURE:
        case devicesConstants.ADD_DEVICE_FAILURE:
        case devicesConstants.DELETE_DEVICE_FAILURE:
        case devicesConstants.USER_DEVICES_GET_FAILURE: {
            return {
                ...state,
                loading: false,
                error: action.payload
            }
        }
        case devicesConstants.CLEAN_DEVICES_ERRORS: {
            return {
                ...state,
                error: null
            }
        }
        case devicesConstants.CLEAN_DEVICES_SUCCESS: {
            return {
                ...state,
                success: null
            }
        }
        default:
            return state;
    }
};

