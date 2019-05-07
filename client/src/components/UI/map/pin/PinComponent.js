import {PureComponent} from "react";
import React from "react";
import './pin.scss';

const pinStyle = {
    fill: '#d00',
    stroke: 'none'
};

// https://github.com/uber/react-map-gl/tree/4.1-release/examples/controls

export default class Pin extends PureComponent {

    render() {
        const {size = 20, onClick} = this.props;

        return (
            <svg
                className='marker-icon'
                height={size}
                viewBox="0 0 24 24"
                style={pinStyle}
                onClick={onClick}
            >
                <image href="https://static.thenounproject.com/png/17626-200.png" width="24" height="24"/>
            </svg>
        );
    }
}
