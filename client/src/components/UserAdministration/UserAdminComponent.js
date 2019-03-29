import React from "react";
import * as PropTypes from 'prop-types';

export default class UserAdminComponent extends React.Component {
    render() {
        const {selectedFirm} = this.props;
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
