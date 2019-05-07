import {createStore, applyMiddleware, compose} from "redux";
import {rootReducer} from '../reducers/index';
import {
    loginMiddleWare,
    firmMiddleWare,
    usersMiddleWare,
    devicesMiddleWare,
    dataMiddleWare
} from "../middleware/index";

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    rootReducer,
    storeEnhancers(applyMiddleware(
        loginMiddleWare,
        firmMiddleWare,
        usersMiddleWare,
        devicesMiddleWare,
        dataMiddleWare
    ))
);

export default store;
