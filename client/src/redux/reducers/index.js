import {combineReducers} from 'redux';
import {loginReducer} from './login';
import {firmReducer} from './firms';
import {userReducer} from "./users";

export const rootReducer = combineReducers({
    loginReducer,
    firmReducer,
    userReducer
});

