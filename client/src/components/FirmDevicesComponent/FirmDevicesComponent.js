import React from "react";
import * as PropTypes from 'prop-types';
import {tokenService} from "../../redux/services/token";
import {firmDevicesRequest} from "../../redux/actions";

import {connect} from "react-redux";
import store from "../../redux/store";

const mapDispatchToProps = (dispatch) => {
    return {
        firmDevicesRequest: (payload) => dispatch(firmDevicesRequest(payload)),
    };
};

const mapStateToProps = state => {
    return {devices: state.devicesReducer.devices};
};

class FirmDevicesComponent extends React.Component {

    state = {
        selectedFirm: null,
        user: null
    };

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            this.props.firmDevicesRequest(this.props.selectedFirm._id);
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.props.firmDevicesRequest(selectedFirm._id);
            this.setState({selectedFirm});
        }
    }

    render() {
        const {selectedFirm} = this.state;
        return (
            <div>
                <h2>
                    Firm devices
                </h2>
                {selectedFirm && <p>{selectedFirm.name}</p>}
            </div>
        )
    }
}

FirmDevicesComponent.propTypes = {
    selectedFirm: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(FirmDevicesComponent);
