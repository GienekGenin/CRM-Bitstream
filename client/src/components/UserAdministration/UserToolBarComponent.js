import React from "react";
import * as PropTypes from 'prop-types';

import './userAdmin.scss';

import DeleteIcon from '@material-ui/icons/Delete';
import {connect} from "react-redux";
import {
    usersRequest,
    addUserRequest,
    deleteUserRequest,
    updateUserRequest,
    changePassAdminRequest,
    changeEmailAdminRequest
} from "../../redux/actions";

import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';

const mapDispatchToProps = (dispatch) => {
    return {
        usersRequest: (firmId) => dispatch(usersRequest(firmId)),
        addUserRequest: (user) => dispatch(addUserRequest(user)),
        deleteUserRequest: (email) => dispatch(deleteUserRequest(email)),
        updateUserRequest: (user) => dispatch(updateUserRequest(user)),
        changePassAdminRequest: (credentials) => dispatch(changePassAdminRequest(credentials)),
        changeEmailAdminRequest: (email, newEmail) => dispatch(changeEmailAdminRequest(email, newEmail)),
    };
};

class UserToolBar extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            changePassDialog: false,
            changeEmailDialog: false,
            newUser: {
                name: '',
                surname: '',
                role_id: '',
                email: '',
                password: '',
                tel: ''
            },
            roles: null
        };
    }

    componentWillMount() {
        const roles = JSON.parse(localStorage.getItem('roles'));
        this.setState({roles});
    }

    handleClickOpen = (state) => {
        this.setState({[state]: true});
        if (state === 'editDialog') {
            this.setState({newUser: this.props.selected})
        }
        if (state === 'changePassDialog') {
            this.setState({newUser: Object.assign({}, this.props.selected, {password: ''})})
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newUser: {
                name: '',
                surname: '',
                role_id: '',
                email: '',
                password: '',
                tel: ''
            }
        });
    };

    handleAddUser = () => {
        this.props.addUserRequest(Object.assign({}, this.state.newUser, {firm_id: this.props.selectedFirmId}));
        this.setState({
            addDialog: false,
            newUser: {
                name: '',
                surname: '',
                role_id: '',
                email: '',
                password: '',
                tel: ''
            }
        });
    };

    updateNewUser(e, param) {
        this.setState({newUser: Object.assign({}, this.state.newUser, {[param]: e.target.value})})
    }

    handleDeleteUser() {
        this.props.deleteUserRequest(this.props.selected.email);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateUser() {
        this.props.updateUserRequest(Object.assign({}, this.state.newUser, {firm_id: this.props.selectedFirmId}));
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleChangeUserPassword() {
        const {email, password} = this.state.newUser;
        this.props.changePassAdminRequest({email, password});
        this.props.resetSelected();
        this.handleClose('changePassDialog');
    }

    passwordValidation() {
        const passPattern = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))/;
        const pass = this.state.newUser.password;
        if (!pass) {
            return 'Password is required'
        } else {
            if (!passPattern.test(pass)) {
                return 'Should contain 1 letter and 1 number'
            } else {
                if (pass.length < 6) {
                    return 'Should be at least 6 characters long'
                } else {
                    return '';
                }
            }
        }
    }

    handleChangeUserEmail(){
        const newEmail = this.state.newUser.email;
        const {email} = this.props.selected;
        this.props.changeEmailAdminRequest(email, newEmail);
        this.props.resetSelected();
        this.handleClose('changeEmailDialog');
    }

    emailValidation(){
        const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/i;
        const email = this.state.newUser.email;
        if (!email) {
            return 'Email is required'
        } else {
            if (!emailPattern.test(email)) {
                return 'Incorrect email'
            } else return '';
        }
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleRefresh() {
    }

    render() {
        const {roles} = this.state;
        return (
            <div className="device-controls">
                <div>
                    <Button disabled={this.props.loading || !this.props.selected} variant="contained" color="primary"
                            onClick={() => this.handleClickOpen('editDialog')}>
                        Edit
                        <EditIcon />
                    </Button>
                    <Dialog
                        open={this.state.editDialog}
                        onClose={() => this.handleClose('editDialog')}
                        aria-labelledby="key-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">Edit user</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="name"
                                type="text"
                                required={true}
                                value={this.state.newUser.name}
                                onChange={(e) => this.updateNewUser(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="surname"
                                label="surname"
                                type="text"
                                required={true}
                                value={this.state.newUser.surname}
                                onChange={(e) => this.updateNewUser(e, 'surname')}
                                fullWidth
                            />
                            <FormControl>
                                <InputLabel htmlFor="role">Role</InputLabel>
                                <Select
                                    value={this.state.newUser.role_id}
                                    onChange={(e) => this.updateNewUser(e, 'role_id')}
                                    id='role'
                                >
                                    {roles.map((el, i) => <MenuItem key={i} value={el._id}>{el.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="email"
                                type="text"
                                required={true}
                                value={this.state.newUser.email}
                                onChange={(e) => this.updateNewUser(e, 'email')}
                                fullWidth
                                disabled={true}
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="pass"
                                label="pass"
                                type="text"
                                required={true}
                                value={this.state.newUser.password}
                                onChange={(e) => this.updateNewUser(e, 'password')}
                                fullWidth
                                disabled={true}
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="tel"
                                label="tel"
                                type="text"
                                required={true}
                                value={this.state.newUser.tel}
                                onChange={(e) => this.updateNewUser(e, 'tel')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleUpdateUser()}>
                                Update
                            </Button>
                            <Button onClick={() => this.handleClose('editDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="outlined" color="primary" disabled={this.props.loading}
                            onClick={() => this.handleClickOpen('addDialog')}>
                        Add
                        <AddIcon />
                    </Button>
                    <Dialog
                        open={this.state.addDialog}
                        onClose={() => this.handleClose('addDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Add user</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="name"
                                type="text"
                                required={true}
                                value={this.state.newUser.name}
                                onChange={(e) => this.updateNewUser(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="surname"
                                label="surname"
                                type="text"
                                required={true}
                                value={this.state.newUser.surname}
                                onChange={(e) => this.updateNewUser(e, 'surname')}
                                fullWidth
                            />
                            <FormControl>
                                <InputLabel htmlFor="role">Role</InputLabel>
                                <Select
                                    value={this.state.newUser.role_id}
                                    onChange={(e) => this.updateNewUser(e, 'role_id')}
                                    id='role'
                                >
                                    {roles.map((el, i) => <MenuItem key={i} value={el._id}>{el.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="email"
                                type="text"
                                required={true}
                                value={this.state.newUser.email}
                                onChange={(e) => this.updateNewUser(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="pass"
                                label="pass"
                                type="text"
                                required={true}
                                value={this.state.newUser.password}
                                onChange={(e) => this.updateNewUser(e, 'password')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="tel"
                                label="tel"
                                type="text"
                                required={true}
                                value={this.state.newUser.tel}
                                onChange={(e) => this.updateNewUser(e, 'tel')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleAddUser()}>
                                Add
                            </Button>
                            <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="contained" color="secondary" disabled={this.props.loading || !this.props.selected}
                            onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                        Delete
                        <DeleteIcon />
                    </Button>
                    <Dialog
                        open={this.state.confirmDeleteDialog}
                        onClose={() => this.handleClose('confirmDeleteDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Delete</DialogTitle>
                        <DialogContent>
                            Confirm deletion of {this.props.selected ? this.props.selected.email : ''}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                Close
                            </Button>
                            <Button disabled={!this.props.selected} variant="contained" color="secondary"
                                    onClick={() => this.handleDeleteUser()}>
                                Confirm
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="outlined" color="primary" disabled={this.props.loading || !this.props.selected}
                            onClick={() => this.handleClickOpen('changePassDialog')}>
                        Change password
                    </Button>
                    <Dialog
                        open={this.state.changePassDialog}
                        onClose={() => this.handleClose('changePassDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Change password</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="pass"
                                label="Password"
                                type="text"
                                required={true}
                                value={this.state.newUser.password}
                                onChange={(e) => this.updateNewUser(e, 'password')}
                                fullWidth
                            />
                            <div>{this.passwordValidation()}</div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary" disabled={!!(this.passwordValidation())}
                                    onClick={() => this.handleChangeUserPassword()}>
                                Submit
                            </Button>
                            <Button onClick={() => this.handleClose('changePassDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="outlined" color="primary" disabled={this.props.loading || !this.props.selected}
                            onClick={() => this.handleClickOpen('changeEmailDialog')}>
                        Change email
                    </Button>
                    <Dialog
                        open={this.state.changeEmailDialog}
                        onClose={() => this.handleClose('changeEmailDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Change email</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="New email"
                                type="text"
                                required={true}
                                value={this.state.newUser.email}
                                onChange={(e) => this.updateNewUser(e, 'email')}
                                fullWidth
                            />
                            <div>{this.emailValidation()}</div>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary" disabled={!!(this.emailValidation())}
                                    onClick={() => this.handleChangeUserEmail()}>
                                Submit
                            </Button>
                            <Button onClick={() => this.handleClose('changeEmailDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <Button variant="contained" disabled={this.props.loading} onClick={() => this.handleRefresh()}>
                    Refresh
                </Button>
            </div>
        )
    }
}

UserToolBar.propTypes = {
    selected: PropTypes.object,
    resetSelected: PropTypes.func,
    selectedFirmId: PropTypes.string,
    loading: PropTypes.bool
};

export default connect(null, mapDispatchToProps)(UserToolBar);
