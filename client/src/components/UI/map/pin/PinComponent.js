import {PureComponent} from "react";
import React from "react";
import './pin.scss';
import IconButton from "@material-ui/core/IconButton";
import LocationOnIcon from '@material-ui/icons/LocationOn';

export default class Pin extends PureComponent {

    render() {
        const {onClick} = this.props;

        return (
            <IconButton variant="outlined" color="primary"
                        onClick={onClick}>
                <LocationOnIcon/>
            </IconButton>
        );
    }
}
