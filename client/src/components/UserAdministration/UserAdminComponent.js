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
        if (this.props.user && this.props.user.role_id === '5c99e474345b492d20a19660') {
            this.setState({selectedFirm: this.props.selectedFirm});
        } else {
            this.setState({selectedFirm: this.props.firm, user: this.props.user});
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
    user: PropTypes.object.isRequired,
    firm: PropTypes.object.isRequired
};
