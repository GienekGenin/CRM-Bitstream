import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {tokenService} from "../redux/services/token";

export const PrivateRoute = ({component: Component, ...rest}) => {
    const permission = checkAccess(rest.path);
    return <Route {...rest} render={props => (
        (tokenService.verifyToken() && permission)
            ? <Component {...props} />
            : <Redirect to={{pathname: '/', state: {from: props.location}}}/>
    )}/>
};

export const checkAccess = (path) => {
    const userStorage = JSON.parse(localStorage.getItem('user'));
    if (!userStorage) return false;
    const key = userStorage.user.role_id;
    const paths = [
        {path: '/firms', keys: ['5c99e474345b492d20a19660']},
        {path: '/editFirms', keys: ['5c99e474345b492d20a19660']},
        {path: '/admin_panel', keys: ['5c99e474345b492d20a19660', '5c99e496345b492d20a19661']},
        {path: '/firmDevices', keys: ['5c99e474345b492d20a19660', '5c99e496345b492d20a19661']},
        {path: '/users', keys: ['5c99e474345b492d20a19660', '5c99e496345b492d20a19661']},
        {path: '/devices', keys: ['5c99e49c345b492d20a19662']},
        {path: '/dashboard', keys: ['5c99e49c345b492d20a19662']}
    ];
    let result = false;
    paths.forEach(el => {
        if (el.path === path && el.keys.includes(key)) {
            return result = true;
        }
    });
    return result;
};
