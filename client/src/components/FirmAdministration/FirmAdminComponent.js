import React from "react";
import * as PropTypes from 'prop-types';

class FirmAdmin extends React.Component {

    constructor(props){
        super(props);

        this.handleFirmSelect = this.handleFirmSelect.bind(this)
    }

    handleFirmSelect(firm){
        this.props.onFirmSelect(firm);
    }

    render() {
        const {firms} = this.props;
        return(
            <div>
                <ul>
                    {firms && firms.map((el,i)=><li onClick={()=>this.handleFirmSelect(el)} key={i}>{el.name}</li>)}
                </ul>
            </div>
        )
    }
}

FirmAdmin.propTypes = {
    firms: PropTypes.array,
    onFirmSelect: PropTypes.func.isRequired
};

export default FirmAdmin;
