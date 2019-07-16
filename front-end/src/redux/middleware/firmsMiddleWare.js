import {firmConstants} from '../constants/index';
import {firmService} from "../services/firm";
import {errorParser} from "../../services/http.service";

export const firmMiddleWare = ({dispatch}) => {
    return (next) => {
        return (action) => {
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
                            payload: {
                                firm,
                                success: 'Firm was successfully created'
                            }
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
            if (action.type === firmConstants.UPDATE_FIRM_REQUEST) {
                firmService.updateFirm(action.payload)
                    .then((firm) => {
                        return dispatch({
                            type: firmConstants.UPDATE_FIRM_SUCCESS,
                            payload: {
                                firm,
                                success: 'Firm was successfully updated'
                            }
                        })
                    })
                    .catch(err => {
                        dispatch({type: firmConstants.UPDATE_FIRM_FAILURE, payload: errorParser(err)})
                    });
            }
            return next(action);
        };
    };
};
