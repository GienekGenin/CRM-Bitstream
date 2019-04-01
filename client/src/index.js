import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App/AppComponent';
import * as serviceWorker from './serviceWorker';
import store from './redux/store';
import {Provider} from "react-redux";
import socketIOClient from "socket.io-client";

const socket = socketIOClient('http://localhost:5000');
socket.emit('Get_Roles');

socket.on('Roles', rolesPayload => {
    localStorage.setItem('roles', JSON.stringify(rolesPayload));
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root'));
});



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
