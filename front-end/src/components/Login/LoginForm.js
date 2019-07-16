import React from 'react';
import * as PropTypes from 'prop-types';

// Redux
import {connect} from 'react-redux';
import {loginRequest} from "../../redux/actions";
import store from "../../redux/store";

// Material
import Grow from "@material-ui/core/Grow";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";

// Services
import {validateField} from "../../services/validation.service";

const mapDispatchToProps = (dispatch) => {
    return {
        loginRequest: (credentials) => dispatch(loginRequest(credentials)),
    };
};

class LoginForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            loading: false,
            showPassword: false,
            emailValid: false,
            passwordValid: false,
            formValid: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleClickShowPassword = this.handleClickShowPassword.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().loginReducer.loading});
        })
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    handleLoginSubmit(e) {
        e.preventDefault();
        const {email, password} = this.state;
        this.props.loginRequest({email, password});
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value}, () => {
            validateField(name, value, this);

        });

    }

    validateForm() {
        const {emailValid, passwordValid} = this.state;
        this.setState({
            formValid: emailValid && passwordValid
        });
    }

    handleClickShowPassword() {
        const {showPassword} = this.state;
        this.setState({
            showPassword: !showPassword
        })
    };

    render() {
        const {email, password, loading, showPassword, formValid, emailValid} = this.state;
        return (
            <Grow in={true}>
                <div>
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
                                {!email && null &&
                                <div className="help-block">Email is required</div>
                                }
                                {
                                    email && !emailValid &&
                                    <div className="help-block">Incorrect email</div>
                                }
                            </div>
                            <div className={'form-group' + (!password ? ' has-error' : '')}>
                                <TextField
                                    required
                                    // id="outlined-password-input"
                                    id="adornment-password"
                                    label="Password"
                                    value={password}
                                    name="password"
                                    // type="password"
                                    onChange={this.handleChange}
                                    autoComplete="current-password"
                                    margin="normal"
                                    variant="outlined"
                                    type={showPassword ? 'text' : 'password'}
                                />
                                <InputAdornment>
                                    <IconButton
                                        aria-label="Toggle password visibility"
                                        onClick={this.handleClickShowPassword}
                                        style={{position: "absolute", right: "5px", bottom: "12px"}}
                                    >
                                        {showPassword ? <Visibility/> : <VisibilityOff/>}
                                    </IconButton>
                                </InputAdornment>
                                {!password && null &&
                                <div className="help-block">Password is required</div>
                                }
                                {
                                    password && password.length < 5 &&
                                    <div className="help-block">Password should NOT be shorter that 5
                                        characters</div>
                                }
                            </div>
                        </CardContent>
                        <CardActions>
                            <div className="loginBtnGroup">
                                <Button variant="contained" type='button' color='primary'
                                        disabled={!formValid} size="large"
                                        onClick={this.handleLoginSubmit}
                                >Submit</Button>
                                <div type='submit' color='black'
                                         style={{textDecoration: 'underline',
                                             display: 'flex',
                                             flexDirection: 'row',
                                             textTransform: 'lowercase',
                                             cursor: 'pointer',
                                             marginTop: '15px'
                                         }}
                                        onClick={()=>this.props.toggleForm()}
                                >Change password</div>
                                {loading && <div id='progressLogin'>
                                    <CircularProgress size={30} style={{marginTop: '15px'}}/>
                                </div>}
                            </div>
                        </CardActions>
                    </Card>
                </div>
            </Grow>
        )
    }
}

LoginForm.propTypes = {
    toggleForm: PropTypes.func.isRequired
};

export default connect(null, mapDispatchToProps)(LoginForm);
