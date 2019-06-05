import React from "react";
import Iframe from 'react-iframe';
import './Home.scss';
import {animate} from "./landingAnimation";

export default class HomeComponent extends React.Component {
    componentDidMount() {
        animate();
    }

    render() {
        return (
            <div className={'home'}>
                <Iframe url="https://bitstream.pl/en/about-us/technical-support/"
                        width="100%"
                        height="100%"
                        id="myId"
                        className="resp-iframe"
                        allowFullScreen/>
                <canvas id="canvas"></canvas>
            </div>
        );
    }
}
