import React from "react";
import store from "../../../redux/store";
import * as PropTypes from "prop-types";
import {withSnackbar} from "notistack";
import {cleanLoginErrors
} from "../../../redux/actions/index";
import {connect} from "react-redux";

const mapDispatchToProps = (dispatch) => {
    return {
        cleanLoginErrors: () => dispatch(cleanLoginErrors()),
    };
};

class Popup extends React.Component {

    constructor(props) {
        super(props);

        store.subscribe(() => {
            if(store.getState().loginReducer.error)
            {
                this.handleClickVariant(store.getState().loginReducer.error, 'warning');
                this.props.cleanLoginErrors();
            }
        })
    }

    handleClickVariant = (message, variant) => {
        // variant could be success, error, warning or info
        if(message){
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
