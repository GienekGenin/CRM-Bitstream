import {combineReducers} from 'redux';
import {loginReducer} from './login';
import {firmReducer} from './firms';
import {userReducer} from "./users";
import {devicesReducer} from "./devices";

export const rootReducer = combineReducers({
    loginReducer,
    firmReducer,
    userReducer,
    devicesReducer
});

