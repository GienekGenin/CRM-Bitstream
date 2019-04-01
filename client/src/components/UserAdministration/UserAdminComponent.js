import React from "react";
import * as PropTypes from 'prop-types';
import {usersRequest} from "../../redux/actions";
import {connect} from "react-redux";

const mapDispatchToProps = (dispatch) => {
    return {
        usersRequest: (firmId) => dispatch(usersRequest(firmId)),
    };
};

const mapStateToProps = state => {
    return {
        users: state.userReducer.users,
    };
};


class UserAdminComponent extends React.Component {

    state = {
        selectedFirm: null,
        user: null
    };

    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            this.props.usersRequest(this.props.selectedFirm._id)
        } else {
            let selectedFirm = JSON.parse(localStorage.getItem('user')).firm;
            this.setState({selectedFirm});
            this.props.usersRequest(selectedFirm._id);
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

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminComponent);
