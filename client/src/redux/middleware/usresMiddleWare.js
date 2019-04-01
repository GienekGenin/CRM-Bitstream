import {userConstants} from '../constants/index';
import {userService} from "../services/user";

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};

export const usersMiddleWare = ({dispatch}) => {
    return function (next) {
        return function (action) {
            if (action.type === userConstants.USERS_GET_REQUEST) {
                userService.getAllByFirmId(action.payload)
                    .then(users => {
                        return dispatch({type: userConstants.USERS_GET_SUCCESS, payload: users})
                    })
                    .catch(err => {
                        dispatch({type: userConstants.USERS_GET_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === userConstants.ADD_USER_REQUEST) {
                userService.addFirm(action.payload)
                    .then((user) => {
                        return dispatch({
                            type: userConstants.ADD_USER_SUCCESS,
                            payload: {
                                user,
                                success: 'User was successfully created'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.ADD_USER_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === userConstants.DELETE_USER_REQUEST) {
                userService.deleteFirm(action.payload)
                    .then((userId) => {
                        return dispatch({
                            type: userConstants.DELETE_USER_SUCCESS,
                            payload: userId
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.DELETE_USER_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === userConstants.UPDATE_USER_REQUEST) {
                userService.updateFirm(action.payload)
                    .then((user) => {
                        return dispatch({
                            type: userConstants.UPDATE_USER_SUCCESS,
                            payload: {
                                user,
                                success: 'User was successfully updated'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.UPDATE_USER_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
