import React from "react";
import {firmRequest} from "../../redux/actions/index";
import {connect} from "react-redux";

const mapDispatchToProps = (dispatch) => {
    return {
        firmRequest: () => dispatch(firmRequest()),
    };
};

const mapStateToProps = state => {
    return {firms: state.firmReducer.firms};
};

class FirmAdmin extends React.Component {

    componentWillMount() {
        this.props.firmRequest();
    }

    render() {
        return(
            <h2>
                Firm admin panel
            </h2>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FirmAdmin);
