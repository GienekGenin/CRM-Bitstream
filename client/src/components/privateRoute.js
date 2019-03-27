import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import {tokenService} from "../redux/services/token";

export const PrivateRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => (
        tokenService.verifyToken()
            ? <Component {...props} />
            : <Redirect to={{pathname: '/login', state: {from: props.location}}}/>
    )}/>
);
