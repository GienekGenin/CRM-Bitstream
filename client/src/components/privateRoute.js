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
    const jwt = tokenService.verifyToken();
    if(!jwt){
        localStorage.removeItem('token');
        return false;
    }
    const user = jwt.user;
    if(user.deleted) {
        return false;
    }
    const roles = JSON.parse(localStorage.getItem('roles'));
    if (!user || !roles) return false;
    const key = user.role_id;
    let result = false;
    roles.forEach(role=>{
       if(key === role._id){
            return result = !!(role.features.includes(path) && tokenService.verifyToken());
       }
    });
    return result;
};


