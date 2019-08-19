import React from 'react';

// Redux
import store from '../../redux/store/index'

// Components
import LoginForm from './LoginForm';
import ChangePassForm from './ChangePassForm';
import './Login.scss';
import {animate} from '../Home/landingAnimation';

export default class LoginPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            loginForm: true
        };

        this.toggleForm = this.toggleForm.bind(this);
    }

    componentDidMount() {
        localStorage.removeItem('token.service.js');
        animate();
        this.unsubscribe = store.subscribe(() => {
            if (store.getState().loginReducer.user) {
                this.props.history.push('/admin-panel');
            }
        })
    }

    toggleForm() {
        const {loginForm} = this.state;
        this.setState({loginForm: !loginForm});
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    render() {
        const {loginForm} = this.state;
        return (
            <div>
                <div id='loginContainer'>
                    {loginForm && <LoginForm toggleForm={this.toggleForm}/>}
                    {!loginForm && <ChangePassForm toggleForm={this.toggleForm}/>}
                </div>
                <canvas id="canvas"></canvas>
            </div>
        );
    }
}
