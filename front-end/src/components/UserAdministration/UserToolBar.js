import React from "react";
import * as PropTypes from 'prop-types';
import _ from 'lodash';

// Material
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
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import EmailIcon from '@material-ui/icons/Email';
import LockIcon from '@material-ui/icons/Lock';
import LinearProgress from "@material-ui/core/LinearProgress";

// Redux
import {connect} from "react-redux";
import {
    usersRequest,
    addUserRequest,
    deleteUserRequest,
    updateUserRequest,
    changePassAdminRequest,
    changeEmailAdminRequest
} from "../../redux/actions";

// Components
import './UsersToolBar.scss';


const mapDispatchToProps = (dispatch) => {
    return {
        usersRequest: (firmId) => dispatch(usersRequest(firmId)),
        addUserRequest: (user) => dispatch(addUserRequest(user)),
        deleteUserRequest: (id, nextOwnerId) => dispatch(deleteUserRequest(id, nextOwnerId)),
        updateUserRequest: (user) => dispatch(updateUserRequest(user)),
        changePassAdminRequest: (credentials) => dispatch(changePassAdminRequest(credentials)),
        changeEmailAdminRequest: (email, newEmail) => dispatch(changeEmailAdminRequest(email, newEmail)),
    };
};

class UserToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            changePassDialog: false,
            changeEmailDialog: false,
            anchorEl: null,
            columns: null,
            columnsDialog: false,
            nextOwner: '',
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
        // this.validateField = this.validateField.bind(this);
        // this.validateForm = this.validateForm.bind(this);
    }

    componentWillMount() {
        const roles = JSON.parse(localStorage.getItem('mainRoles'));
        this.setState({roles});
    }

    handleClickMenu = event => {
        this.setState({anchorEl: event.currentTarget, columnsDialog: true, columns: this.props.columns});
    };

    handleCloseMenu = () => {
        const columns = this.state.columns;
        this.props.addRemoveColumn(columns);
        this.setState({anchorEl: null, columnsDialog: false, columns});
    };

    handleColumnsChange = (title) => {
        let columns = this.state.columns.map((el, i, arr) => el.title === title ? arr[i] = Object.assign(el, {hidden: !el.hidden}) : el);
        this.setState({columns});
    };

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
            nextOwner: '',
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
        const userToAdd = _.omit(this.state.newUser, ['action', 'tableData']);
        this.props.addUserRequest(Object.assign({}, userToAdd, {firm_id: this.props.selectedFirmId}));
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

    updateNextOwner(e) {
        this.setState({nextOwner: e.target.value})
    }

    updateNewUser(e, param) {
        this.setState({newUser: Object.assign({}, this.state.newUser, {[param]: e.target.value})})
    }

    handleDeleteUser() {
        this.props.deleteUserRequest(this.props.selected._id, this.state.nextOwner._id);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateUser() {
        const userToUpdate = _.omit(this.state.newUser, ['action', 'tableData']);
        this.props.updateUserRequest(Object.assign({}, userToUpdate, {firm_id: this.props.selectedFirmId}));
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

    handleChangeUserEmail() {
        const newEmail = this.state.newUser.email;
        const {email} = this.props.selected;
        this.props.changeEmailAdminRequest(email, newEmail);
        this.props.resetSelected();
        this.handleClose('changeEmailDialog');
    }

    emailValidation() {
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

    handleRefresh() {
        this.props.usersRequest(this.props.selectedFirmId);
        this.props.resetSelected();
    }

    render() {
        const {roles, anchorEl, columnsDialog, columns} = this.state;
        return (
            <div>
                <div className="users-toolbar">
                    <div className={'title'}>
                        {this.props.selected ? <h3>
                            Selected {this.props.selected.name}
                        </h3> : <h3>Users</h3>}
                    </div>
                    <div className={'users-controls'}>
                        <div>
                            <Tooltip title={'Edit selected user'}>
                                <div>
                                    <IconButton disabled={this.props.loading || !this.props.selected} variant="contained"
                                                color="primary"
                                                onClick={() => this.handleClickOpen('editDialog')}>
                                        <EditIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
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
                                    <FormControl fullWidth>
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
                                            disabled={
                                                !this.state.newUser.name ||
                                                !this.state.newUser.surname ||
                                                !this.state.newUser.role_id ||
                                                !this.state.newUser.email ||
                                                !this.state.newUser.password ||
                                                !this.state.newUser.tel
                                            }
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
                            <Tooltip title={'Add new user'}>
                                <div>
                                    <IconButton variant="outlined" color="primary" disabled={this.props.loading}
                                                onClick={() => this.handleClickOpen('addDialog')}>
                                        <AddIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
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
                                    <FormControl fullWidth>
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
                                            disabled={
                                                !this.state.newUser.name ||
                                                !this.state.newUser.surname ||
                                                !this.state.newUser.role_id ||
                                                !this.state.newUser.email ||
                                                !this.state.newUser.password ||
                                                !this.state.newUser.tel
                                            }
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
                            <Tooltip title={'Delete user'}>
                                <div>
                                    <IconButton variant="outlined" color="secondary"
                                                disabled={this.props.loading || !this.props.selected}
                                                onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                                        <DeleteIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
                            <Dialog
                                open={this.state.confirmDeleteDialog}
                                onClose={() => this.handleClose('confirmDeleteDialog')}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                            >
                                <DialogTitle id="alert-dialog-title-">Delete</DialogTitle>
                                {this.props.selected && <DialogContent>
                                    Confirm deletion of {this.props.selected.email}
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="nextOwner">Next owner</InputLabel>
                                        <Select
                                            value={this.state.nextOwner}
                                            onChange={(e) => this.updateNextOwner(e)}
                                            id='nextOwner'
                                        >
                                            {this.props.users && this.props.users.map((user) =>
                                                (user.email !== this.props.selected.email) &&
                                                <MenuItem key={user._id} value={user}>
                                                    {user.name}
                                                </MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </DialogContent>}
                                <DialogActions>
                                    <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                        Close
                                    </Button>
                                    <Button disabled={!this.state.nextOwner} variant="contained" color="secondary"
                                            onClick={() => this.handleDeleteUser()}>
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>
                        </div>
                        <div>
                            <Tooltip title={'Change password'}>
                                <div>
                                    <IconButton variant="outlined" color="primary"
                                                disabled={this.props.loading || !this.props.selected}
                                                onClick={() => this.handleClickOpen('changePassDialog')}>
                                        <LockIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
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
                            <Tooltip title={'Change email'}>
                                <div>
                                    <IconButton variant="outlined" color="primary"
                                                disabled={this.props.loading || !this.props.selected}
                                                onClick={() => this.handleClickOpen('changeEmailDialog')}>
                                        <EmailIcon/>
                                    </IconButton>
                                </div>
                            </Tooltip>
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
                        <Tooltip title={'Refresh users list'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={this.props.loading}
                                            onClick={() => this.handleRefresh()}>
                                    <RefreshIcon/>
                                </IconButton>
                            </div>
                        </Tooltip>
                        <Tooltip title={'Show columns'}>
                            <div>
                                <IconButton variant="outlined" color="primary" disabled={this.props.loading}
                                            onClick={this.handleClickMenu}>
                                    <ViewColumnIcon/>
                                </IconButton>
                                <Menu
                                    id="long-menu"
                                    open={columnsDialog}
                                    anchorEl={anchorEl}
                                    onClose={this.handleCloseMenu}
                                    PaperProps={{
                                        style: {
                                            maxHeight: 45 * 4.5,
                                            width: 250,
                                        },
                                    }}
                                >
                                    <List id={'column-list'}>
                                        {columns && columns.map(el => (
                                            <div key={el.title}>
                                                <Divider dark={'true'}/>
                                                <ListItem key={el.title} dense button disabled={el.field === 'action'}
                                                          onClick={() => this.handleColumnsChange(el.title)}>
                                                    <Checkbox checked={!el.hidden}/>
                                                    <ListItemText primary={el.title}/>
                                                </ListItem>
                                            </div>
                                        ))}
                                        <Button fullWidth={true} onClick={this.handleCloseMenu} className={'submit-button'}>
                                            Submit
                                        </Button>
                                    </List>
                                </Menu>
                            </div>
                        </Tooltip>
                    </div>
                </div>
                {this.props.loading && <div className={'progress'}>
                    <LinearProgress />
                </div>}
            </div>
        )
    }
}

UserToolBar.propTypes = {
    selected: PropTypes.object,
    resetSelected: PropTypes.func,
    selectedFirmId: PropTypes.string,
    loading: PropTypes.bool,
    users: PropTypes.array,
    addRemoveColumn: PropTypes.func,
    columns: PropTypes.array
};

export default connect(null, mapDispatchToProps)(UserToolBar);
