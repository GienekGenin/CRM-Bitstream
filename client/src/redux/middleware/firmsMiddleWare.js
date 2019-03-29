import {firmConstants} from '../constants/index';
import {firmService} from "../services/firm";

const errorParser = (err) => {
    let errorPayload = '';
    if (err.length > 0) {
        err.forEach((e, i) => errorPayload += `${i + 1}) ${e.message}.\n`)
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
            if (action.type === firmConstants.ADD_FIRM_REQUEST) {
                firmService.addFirm(action.payload)
                    .then((firm) => {
                        return dispatch({
                            type: firmConstants.ADD_FIRM_SUCCESS,
                            payload: firm
                        })
                    })
                    .catch(err => {
                        dispatch({type: firmConstants.ADD_FIRM_FAILURE, payload: errorParser(err)})
                    });
            }
            if (action.type === firmConstants.DELETE_FIRM_REQUEST) {
                firmService.deleteFirm(action.payload)
                    .then((firmId) => {
                        return dispatch({
                            type: firmConstants.DELETE_FIRM_SUCCESS,
                            payload: firmId
                        })
                    })
                    .catch(err => {
                        dispatch({type: firmConstants.DELETE_FIRM_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
