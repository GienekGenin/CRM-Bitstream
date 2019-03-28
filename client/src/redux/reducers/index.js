import {combineReducers} from 'redux';
import {loginReducer} from './login';
import {firmReducer} from './firms';

export const rootReducer = combineReducers({
    loginReducer,
    firmReducer
});

