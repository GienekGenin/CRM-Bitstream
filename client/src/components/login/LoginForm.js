import React from 'react';
import {connect} from 'react-redux';
import {loginRequest, changePassRequest} from "../../redux/actions/index";
import {history} from '../../redux/services/history';
import store from '../../redux/store/index'
import TextField from '@material-ui/core/TextField';
import './login.scss';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import CardActions from '@material-ui/core/CardActions';
import Grow from '@material-ui/core/Grow';
import CircularProgress from '@material-ui/core/CircularProgress';

const mapDispatchToProps = (dispatch) => {
    return {
        loginRequest: (credentials) => dispatch(loginRequest(credentials)),
        changePassRequest: (credentials) => dispatch(changePassRequest(credentials)),
    };
};

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            newPassword: '',
            login: true,
            loading: false
        };

        history.listen((location, action) => {

        });

        this.handleChange = this.handleChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.handleChangePassSubmit = this.handleChangePassSubmit.bind(this);

        store.subscribe(() => {
            if (store.getState().loginReducer.user) {
                this.props.history.push('/dash');
            }
            this.setState({loading: store.getState().loginReducer.loading});
        })
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value});
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const {email, password} = this.state;
        this.props.loginRequest({email, password});
    }

    handleChangePassSubmit(e){
        e.preventDefault();
        const {email, password, newPassword} = this.state;
        this.props.changePassRequest({email, password, newPassword});
    }

    switchView(){
        const {login} = this.state;
        this.setState({login: !login});
    }

    render() {
        const {email, password, newPassword, login, loading} = this.state;
        const passPattern = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;
        return (
            <div>
                <div id='loginContainer'>
                    <Grow in={true}>
                        <form name="form" onSubmit={this.handleLoginSubmit}>
                            <Card className="login">
                                <CardHeader
                                    title="Login"
                                />
                                <CardContent>
                                    <div className={'form-group' + (!email ? ' has-error' : '')}>
                                        <TextField
                                            required
                                            id="outlined-email-input"
                                            label="Email"
                                            type="email"
                                            name="email"
                                            value={email}
                                            onChange={this.handleChange}
                                            autoComplete="email"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                        {!email &&
                                        <div className="help-block">Email is required</div>
                                        }
                                    </div>
                                    <div className={'form-group' + (!password ? ' has-error' : '')}>
                                        <TextField
                                            required
                                            id="outlined-password-input"
                                            label="Password"
                                            value={password}
                                            name="password"
                                            type="password"
                                            onChange={this.handleChange}
                                            autoComplete="current-password"
                                            margin="normal"
                                            variant="outlined"
                                        />
                                        {!password &&
                                        <div className="help-block">Password is required</div>
                                        }
                                        {
                                            password && password.length<5 && <div className="help-block">Password should NOT be shorter that 5 characters</div>
                                        }
                                    </div>
                                </CardContent>
                                <CardActions>
                                    <div className="loginBtnGroup">
                                        <Button variant="contained" type='submit' color="inherit" disabled={loading}>Submit</Button>
                                        {loading &&<div id='progressLogin'>
                                            <CircularProgress  size={25}/>
                                        </div>}
                                    </div>
                                </CardActions>
                            </Card>
                        </form>
                    </Grow>
                </div>
            </div>
        );
    }
}

const LoginForm = connect(null, mapDispatchToProps)(LoginPage);

export default LoginForm;
