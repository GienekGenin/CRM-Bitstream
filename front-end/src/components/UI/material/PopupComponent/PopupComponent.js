import React from "react";
import store from "../../../../redux/store";
import * as PropTypes from "prop-types";
import {withSnackbar} from "notistack";
import {
    cleanLoginErrors,
    cleanLoginSuccess,
    cleanFirmsErrors,
    cleanFirmsSuccess,
    cleanUsersErrors,
    cleanUsersSuccess,
    cleanDevicesErrors,
    cleanDevicesSuccess,
    cleanDataErrors,
    cleanDataSuccess
} from "../../../../redux/actions/index";
import {connect} from "react-redux";

const mapDispatchToProps = (dispatch) => {
    return {
        cleanLoginErrors: () => dispatch(cleanLoginErrors()),
        cleanLoginSuccess: () => dispatch(cleanLoginSuccess()),
        cleanFirmsErrors: () => dispatch(cleanFirmsErrors()),
        cleanFirmsSuccess: () => dispatch(cleanFirmsSuccess()),
        cleanUsersErrors: () => dispatch(cleanUsersErrors()),
        cleanUsersSuccess: () => dispatch(cleanUsersSuccess()),
        cleanDevicesErrors: () => dispatch(cleanDevicesErrors()),
        cleanDevicesSuccess: () => dispatch(cleanDevicesSuccess()),
        cleanDataErrors: () => dispatch(cleanDataErrors()),
        cleanDataSuccess: () => dispatch(cleanDataSuccess()),
    };
};

class Popup extends React.Component {

    constructor(props) {
        super(props);

        store.subscribe(() => {
            if (store.getState().loginReducer.error) {
                this.handleClickVariant(store.getState().loginReducer.error, 'warning');
                this.props.cleanLoginErrors();
            }
            if (store.getState().loginReducer.success) {
                this.handleClickVariant(store.getState().loginReducer.success, 'success');
                this.props.cleanLoginSuccess();
            }
            if (store.getState().firmReducer.error) {
                this.handleClickVariant(store.getState().firmReducer.error, 'warning');
                this.props.cleanFirmsErrors();
            }
            if (store.getState().firmReducer.success) {
                this.handleClickVariant(store.getState().firmReducer.success, 'success');
                this.props.cleanFirmsSuccess();
            }
            if (store.getState().userReducer.error) {
                this.handleClickVariant(store.getState().userReducer.error, 'warning');
                this.props.cleanUsersErrors();
            }
            if (store.getState().userReducer.success) {
                this.handleClickVariant(store.getState().userReducer.success, 'success');
                this.props.cleanUsersSuccess();
            }
            if (store.getState().devicesReducer.error) {
                this.handleClickVariant(store.getState().devicesReducer.error, 'warning');
                this.props.cleanDevicesErrors();
            }
            if (store.getState().devicesReducer.success) {
                this.handleClickVariant(store.getState().devicesReducer.success, 'success');
                this.props.cleanDevicesSuccess();
            }
            if (store.getState().dataReducer.error) {
                this.handleClickVariant(store.getState().dataReducer.error, 'warning');
                this.props.cleanDataErrors();
            }
            if (store.getState().dataReducer.success) {
                this.handleClickVariant(store.getState().dataReducer.success, 'success');
                this.props.cleanDataSuccess();
            }
        })
    }

    handleClickVariant = (message, variant) => {
        // variant could be success, error, warning or info
        if (message) {
            this.props.enqueueSnackbar(message, {variant});
        }
    };

    render() {
        return (
            <React.Fragment>
            </React.Fragment>
        );
    }
}

Popup.propTypes = {
    enqueueSnackbar: PropTypes.func.isRequired,
};

const PopupWithProps = connect(null, mapDispatchToProps)(Popup);

export const PopupComponent = withSnackbar(PopupWithProps);
