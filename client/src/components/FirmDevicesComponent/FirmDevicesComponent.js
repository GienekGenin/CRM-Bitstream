import React from "react";
import * as PropTypes from 'prop-types';
import {tokenService} from "../../redux/services/token";

export default class FirmDevicesComponent extends React.Component {

    state = {
        selectedFirm: null,
        user: null
    };

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
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
