import {loginConstants} from '../constants/index';
import {userService} from "../services/login";
import {history} from '../services/history';

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e,i) => errorPayload += `${i+1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};

export const loginMiddleWare = ({dispatch}) => {
    return function (next) {
        return function (action) {
            if (action.type === loginConstants.LOGIN_REQUEST) {
                userService.login(action.payload.email, action.payload.password)
                    .then(userData => {
                        return dispatch({type: loginConstants.LOGIN_SUCCESS, payload: {user: userData.user, firm: userData.firm}})
                    })
                    .catch(err => {
                        dispatch({type: loginConstants.LOGIN_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === loginConstants.LOGOUT_REQUEST) {
                history.push('/login');
                localStorage.removeItem('user');
            }
            return next(action);
        };
    };
};
