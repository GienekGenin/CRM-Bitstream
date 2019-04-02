import {loginConstants} from '../constants/index';
import {userService} from "../services/login";
import {tokenService} from "../services/token";

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};

export const loginMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
            if (action.type === loginConstants.LOGIN_REQUEST) {
                userService.login(action.payload.email, action.payload.password)
                    .then(() => {
                        const decoded = tokenService.verifyToken();
                        return dispatch({
                            type: loginConstants.LOGIN_SUCCESS,
                            payload: {user: decoded.user, firm: decoded.firm}
                        })
                    })
                    .catch(err => {
                        dispatch({type: loginConstants.LOGIN_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === loginConstants.LOGOUT_REQUEST) {
                userService.logout();
            }
            return next(action);
        };
    };
};
