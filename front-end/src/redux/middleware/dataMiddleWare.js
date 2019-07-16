import {dataConstants} from '../constants/index';
import {dataService} from "../services/data";
import {errorParser} from "../../services/http.service";

export const dataMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
            if (action.type === dataConstants.TIME_GET_REQUEST) {
                dataService.getMinMaxDataTime(action.payload)
                    .then((data) => {
                        return dispatch({
                            type: dataConstants.TIME_GET_REQUEST_SUCCESS,
                            payload: {
                                minSelectedDate: data.minTime,
                                maxSelectedDate: data.maxTime,
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: dataConstants.TIME_GET_REQUEST_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === dataConstants.DATA_GET_REQUEST) {
                dataService.getData(action.payload)
                    .then((data) => {
                        return dispatch({
                            type: dataConstants.DATA_GET_REQUEST_SUCCESS,
                            payload: data
                        })
                    })
                    .catch(err => {
                        dispatch({type: dataConstants.DATA_GET_REQUEST_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
