import {devicesConstants} from "../constants/index";

const initialState = {
    devices: null,
    loading: false,
    error: null,
    success: null
};

export const devicesReducer = (state = initialState, action) => {
    switch (action.type) {

        case devicesConstants.ADD_FIRM_DEVICE_REQUEST:
        case devicesConstants.UPDATE_FIRM_DEVICE_REQUEST:
        case devicesConstants.DELETE_FIRM_DEVICE_REQUEST:
        case devicesConstants.UPDATE_DEVICE_USERS_REQUEST:
        case devicesConstants.USER_DEVICES_GET_REQUEST: {
            return {
                ...state,
                loading: true
            }
        }
        case devicesConstants.UPDATE_DEVICE_USERS_SUCCESS: {
            let newDevices = [];
            state.devices.forEach(device => {
                action.payload.forEach(updatedDevice => {
                    if (device.sid === updatedDevice.sid) {
                        newDevices.push(updatedDevice);
                    } else {
                        newDevices.push(device);
                    }
                })
            });
            return {
                ...state,
                devices: newDevices,
                loading: false,
                success: 'Device users were successfully updated'
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
        case devicesConstants.UPDATE_FIRM_DEVICE_SUCCESS: {
            return {
                devices: state.devices.map(el => (el._id === action.payload._id) ? action.payload : el),
                loading: false,
                success: action.payload.success
            }
        }
        case devicesConstants.DELETE_FIRM_DEVICE_SUCCESS: {
            return {
                devices: state.devices.filter(el => !el.sid.includes(action.payload)),
                loading: false,
                success: 'Device was successfully deleted'
            }
        }
        case devicesConstants.USER_DEVICES_GET_SUCCESS: {
            return Object.assign({}, state, {
                devices: action.payload,
                loading: false,
                success: 'User devices loaded successfully'
            });
        }
        case devicesConstants.UPDATE_FIRM_DEVICE_FAILURE:
        case devicesConstants.ADD_DEVICE_FAILURE:
        case devicesConstants.DELETE_DEVICE_FAILURE:
        case devicesConstants.USER_DEVICES_GET_FAILURE:
        case devicesConstants.UPDATE_DEVICE_USERS_FAILURE: {
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

