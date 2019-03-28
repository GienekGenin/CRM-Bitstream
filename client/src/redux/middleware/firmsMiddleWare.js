import {firmConstants} from '../constants/index';
import {firmService} from "../services/firm";

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e,i) => errorPayload += `${i+1}) ${e.message}.\n`)
    } else errorPayload = err.message;
    return errorPayload;
};

export const firmMiddleWare = ({dispatch}) => {
    return function (next) {
        return function (action) {
            if (action.type === firmConstants.FIRMS_GET_REQUEST) {
                firmService.getAll()
                    .then(firms => {
                        return dispatch({type: firmConstants.FIRMS_GET_SUCCESS, payload: firms})
                    })
                    .catch(err => {
                        dispatch({type: firmConstants.FIRMS_GET_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
