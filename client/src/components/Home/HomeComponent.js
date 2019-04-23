import React from "react";
import Iframe from 'react-iframe';
import './home.scss';
import {animate} from "./landingAnimation";

export default class HomeComponent extends React.Component {
    componentDidMount() {
        animate();
    }

    render() {
        return (
            <div>
                <Iframe url="http://bitstream.pl/en/about-us/"
                        width="100%"
                        height="100%"
                        id="myId"
                        className="myClassname"
                        display="initial"
                        position="absolute"
                        allowFullScreen/>
                <canvas id="canvas"></canvas>
            </div>
        );
    }
}
