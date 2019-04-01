import React from "react";
import * as PropTypes from 'prop-types';

export default class UserAdminComponent extends React.Component {

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
            let selectedFirm = JSON.parse(localStorage.getItem('user')).firm;
            this.setState({selectedFirm});
        }
    }

    render() {
        const {selectedFirm} = this.state;
        return(
            <div>
                <h2>
                    User admin panel
                </h2>
                {selectedFirm && <p>{selectedFirm.name}</p>}
            </div>
        )
    }
}

UserAdminComponent.propTypes = {
    selectedFirm: PropTypes.object,
};
