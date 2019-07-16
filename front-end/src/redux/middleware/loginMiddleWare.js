import {loginConstants} from '../constants/index';
import {userService} from "../services/login";
import {tokenService} from "../services/token";
import {errorParser} from "../services/common";

export const loginMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
            if (action.type === loginConstants.LOGIN_REQUEST) {
                userService.login(action.payload.email, action.payload.password)
                    .then((token) => {
                        localStorage.setItem('token', token);
                        const decoded = tokenService.verifyToken();
                        return dispatch({
                            type: loginConstants.SET_USER,
                            payload: {user: decoded.user, firm: decoded.firm}
                        });
                    })
                    .catch(err => {
                        dispatch({type: loginConstants.LOGIN_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === loginConstants.CHANGE_PASS_REQUEST) {
                userService.changePass(action.payload)
                    .then((token) => {
                        localStorage.setItem('token', token);
                        const decoded = tokenService.verifyToken();
                        return dispatch({
                            type: loginConstants.SET_USER,
                            payload: {user: decoded.user, firm: decoded.firm}
                        });
                    })
                    .catch(err => {
                        dispatch({type: loginConstants.CHANGE_PASS_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === loginConstants.LOGOUT_REQUEST) {
                userService.logout();
            }
            return next(action);
        };
    };
};
