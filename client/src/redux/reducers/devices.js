import {devicesConstants} from "../constants/index";

const initialState = {
    devices: null,
    loading: false,
    error: null,
    success: null
};

export const devicesReducer = (state = initialState, action) => {
    switch (action.type) {

        case devicesConstants.FIRM_DEVICES_GET_REQUEST:
        case devicesConstants.ADD_DEVICE_REQUEST:
        case devicesConstants.UPDATE_DEVICE_REQUEST:
        case devicesConstants.DELETE_DEVICE_REQUEST: {
            return {
                ...state,
                loading: true
            }
        }
        case devicesConstants.ADD_DEVICE_SUCCESS: {
            return {
                ...state,
                devices: [...state.devices, action.payload.device],
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.UPDATE_DEVICE_SUCCESS:{
            return {
                ...state,
                devices: state.devices.map(el => (el._id === action.payload.device._id) ? action.payload.device : el),
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.DELETE_DEVICE_SUCCESS: {
            return {
                devices: state.devices.filter(el => el._id !== action.payload),
                loading: false,
                success: 'Firm was successfully deleted'
            }
        }
        case devicesConstants.FIRM_DEVICES_GET_SUCCESS: {
            return Object.assign({}, state, {
                devices: action.payload,
                loading: false,
                success: 'Devices loaded successfully'
            });
        }
        case devicesConstants.FIRM_DEVICES_GET_FAILURE:
        case devicesConstants.UPDATE_DEVICE_FAILURE:
        case devicesConstants.ADD_DEVICE_FAILURE:
        case devicesConstants.DELETE_DEVICE_FAILURE: {
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
