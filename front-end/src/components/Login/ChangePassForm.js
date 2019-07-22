import React from 'react';
import * as PropTypes from 'prop-types';

// Redux
import {connect} from 'react-redux';
import {changePassRequest} from '../../redux/actions';

// Material
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grow from '@material-ui/core/Grow';

const mapDispatchToProps = (dispatch) => {
    return {
        changePassRequest: (credentials) => dispatch(changePassRequest(credentials)),
    };
};

class ChangePassForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            newPassword: '',
            loading: false,
            emailValid: false,
            passwordValid: false,
            formValid: false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangePassSubmit = this.handleChangePassSubmit.bind(this);
    }

    handleChangePassSubmit(e) {
        e.preventDefault();
        const {email, password, newPassword} = this.state;
        this.props.changePassRequest({email, password, newPassword});
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({[name]: value}, () => {
            this.validateField(name, value)
        });
    }

    validateField(fieldName, value) {
        let {emailValid, passwordValid} = this.state;

        switch (fieldName) {
            case 'email':
                const pattern = new RegExp(/^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                emailValid = pattern.test(value);
                break;
            case 'password':
                passwordValid = value.length >= 5;
                break;
            default:
                break;
        }
        this.setState({
            emailValid,
            passwordValid
        }, this.validateForm);
    }

    validateForm() {
        let {emailValid, passwordValid} = this.state;

        this.setState({
            formValid: emailValid && passwordValid
        });
    }

    render() {
        const {email, password, newPassword, loading, formValid, emailValid} = this.state;
        return (
            <Grow in={true}>
                <div>
                    <Card className="login">
                        <CardHeader
                            title="Change password"
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
                                {
                                    email && !emailValid &&
                                    <div className="help-block">Incorrect email</div>
                                }
                            </div>
                            <div className={'form-group' + (!password ? ' has-error' : '')}>
                                <TextField
                                    required
                                    id="password"
                                    label="Password"
                                    value={password}
                                    name="password"
                                    type="password"
                                    onChange={this.handleChange}
                                    margin="normal"
                                    variant="outlined"

                                />
                                {!password &&
                                <div className="help-block">Password is required</div>
                                }
                                {
                                    password && password.length < 5 &&
                                    <div className="help-block">Password should NOT be shorter that 5
                                        characters</div>
                                }
                            </div>
                            <div className={'form-group' + (!newPassword ? ' has-error' : '')}>
                                <TextField
                                    required
                                    id="newPassword"
                                    label="New password"
                                    value={newPassword}
                                    name="newPassword"
                                    type="password"
                                    onChange={this.handleChange}
                                    margin="normal"
                                    variant="outlined"

                                />
                                {!password &&
                                <div className="help-block">Password is required</div>
                                }
                                {
                                    newPassword && newPassword.length < 5 &&
                                    <div className="help-block">Password should NOT be shorter that 5
                                        characters</div>
                                }
                            </div>
                        </CardContent>
                        <CardActions>
                            <div className="loginBtnGroup">
                                <Button variant="contained" type='button' color='primary'
                                        disabled={!formValid} size="large" style={{marginRight: '25px'}}
                                        onClick={this.handleChangePassSubmit}
                                >Submit</Button>
                                <Button variant="outlined" type='submit' color='primary'
                                        size="large"
                                        onClick={() => this.props.toggleForm()}
                                >Login</Button>
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

ChangePassForm.propTypes = {
    toggleForm: PropTypes.func.isRequired
};

export default connect(null, mapDispatchToProps)(ChangePassForm);
