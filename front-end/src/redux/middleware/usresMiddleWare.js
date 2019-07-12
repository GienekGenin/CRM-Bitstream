import {userConstants} from '../constants/index';
import {userService} from "../services/user";
import {errorParser} from "../services/common";

export const usersMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
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
                userService.addUser(action.payload)
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
                userService.deleteUser(action.payload)
                    .then((payload) => {
                        return dispatch({
                            type: userConstants.DELETE_USER_SUCCESS,
                            payload
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.DELETE_USER_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === userConstants.UPDATE_USER_REQUEST) {
                userService.updateUser(action.payload)
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
            if (action.type === userConstants.CHANGE_PASS_ADMIN_REQUEST) {
                userService.changePassAdmin(action.payload)
                    .then((user) => {
                        return dispatch({
                            type: userConstants.CHANGE_PASS_ADMIN_SUCCESS,
                            payload: {
                                user,
                                success: 'Password was changed'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.CHANGE_PASS_ADMIN_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === userConstants.CHANGE_EMAIL_ADMIN_REQUEST) {
                userService.changeEmailAdmin(action.payload)
                    .then((data) => {
                        return dispatch({
                            type: userConstants.CHANGE_EMAIL_ADMIN_SUCCESS,
                            payload: {
                                user: data.user,
                                oldEmail: data.oldEmail,
                                success: 'Email was changed'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: userConstants.CHANGE_EMAIL_ADMIN_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
