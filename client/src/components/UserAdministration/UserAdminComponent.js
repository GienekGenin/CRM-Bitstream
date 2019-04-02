import React from "react";
import * as PropTypes from 'prop-types';

import './userAdmin.scss';

import classNames from 'classnames';
import {lighten} from '@material-ui/core/styles/colorManipulator';
import {withStyles} from '@material-ui/core/styles';
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Tooltip from "@material-ui/core/Tooltip";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import FilterListIcon from '@material-ui/icons/FilterList';

import {createData, desc, stableSort, getSorting, rows} from "./users-table.service";
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";

import store from "../../redux/store";
import {connect} from "react-redux";
import {usersRequest, addUserRequest, deleteUserRequest, updateUserRequest} from "../../redux/actions";

import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import TextField from "@material-ui/core/TextField";
import LinearProgress from "@material-ui/core/LinearProgress";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import {tokenService} from "../../redux/services/token";

const mapDispatchToProps = (dispatch) => {
    return {
        usersRequest: (firmId) => dispatch(usersRequest(firmId)),
        addUserRequest: (user) => dispatch(addUserRequest(user)),
        deleteUserRequest: (email) => dispatch(deleteUserRequest(email)),
        updateUserRequest: (user) => dispatch(updateUserRequest(user)),
    };
};

const mapStateToProps = state => {
    return {
        users: state.userReducer.users,
    };
};

class UserToolBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editDialog: false,
            addDialog: false,
            confirmDeleteDialog: false,
            newFirm: {
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
            this.setState({newFirm: this.props.selected})
        }
    };

    handleClose = (state) => {
        this.setState({
            [state]: false,
            newFirm: {
                name: '',
                surname: '',
                role_id: '',
                email: '',
                password: '',
                tel: ''
            }
        });
    };

    handleAddDevice = () => {
        this.props.addUserRequest(Object.assign({}, this.state.newFirm, {firm_id: this.props.selectedFirmId}));
        this.setState({
            addDialog: false,
            newFirm: {
                name: '',
                surname: '',
                role_id: '',
                email: '',
                password: '',
                tel: ''
            }
        });
    };

    updateNewFirm(e, param) {
        this.setState({newFirm: Object.assign({}, this.state.newFirm, {[param]: e.target.value})})
    }

    handleDeleteDevice() {
        this.props.deleteUserRequest(this.props.selected.email);
        this.props.resetSelected();
        this.handleClose('confirmDeleteDialog');
    }

    handleUpdateFirm() {
        this.props.updateUserRequest(Object.assign({}, this.state.newFirm, {firm_id: this.props.selectedFirmId}));
        this.props.resetSelected();
        this.handleClose('editDialog');
    }

    handleRefresh() {
    }

    render() {
        const {roles} = this.state;
        return (
            <div className="device-controls">
                <div>
                    <Button disabled={!this.props.selected} variant="contained" color="primary"
                            onClick={() => this.handleClickOpen('editDialog')}>
                        editDialog
                    </Button>
                    <Dialog
                        open={this.state.editDialog}
                        onClose={() => this.handleClose('editDialog')}
                        aria-labelledby="key-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">editDialog</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="surname"
                                label="surname"
                                type="text"
                                required={true}
                                value={this.state.newFirm.surname}
                                onChange={(e) => this.updateNewFirm(e, 'surname')}
                                fullWidth
                            />
                            <FormControl>
                                <InputLabel htmlFor="role">Role</InputLabel>
                                <Select
                                    value={this.state.newFirm.role_id}
                                    onChange={(e) => this.updateNewFirm(e, 'role_id')}
                                    id='role'
                                >
                                    {roles.map((el, i)=><MenuItem key={i} value={el._id}>{el.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="pass"
                                label="pass"
                                type="text"
                                required={true}
                                value={this.state.newFirm.password}
                                onChange={(e) => this.updateNewFirm(e, 'password')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="tel"
                                label="tel"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleUpdateFirm()}>
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
                    </Button>
                    <Dialog
                        open={this.state.addDialog}
                        onClose={() => this.handleClose('addDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Add new device</DialogTitle>
                        <DialogContent>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="name"
                                type="text"
                                required={true}
                                value={this.state.newFirm.name}
                                onChange={(e) => this.updateNewFirm(e, 'name')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="surname"
                                label="surname"
                                type="text"
                                required={true}
                                value={this.state.newFirm.surname}
                                onChange={(e) => this.updateNewFirm(e, 'surname')}
                                fullWidth
                            />
                            <FormControl>
                                <InputLabel htmlFor="role">Role</InputLabel>
                                <Select
                                    value={this.state.newFirm.role_id}
                                    onChange={(e) => this.updateNewFirm(e, 'role_id')}
                                    id='role'
                                >
                                    {roles.map((el, i)=><MenuItem key={i} value={el._id}>{el.name}</MenuItem>)}
                                </Select>
                            </FormControl>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="email"
                                label="email"
                                type="text"
                                required={true}
                                value={this.state.newFirm.email}
                                onChange={(e) => this.updateNewFirm(e, 'email')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="pass"
                                label="pass"
                                type="text"
                                required={true}
                                value={this.state.newFirm.password}
                                onChange={(e) => this.updateNewFirm(e, 'password')}
                                fullWidth
                            />
                            <TextField
                                autoFocus
                                margin="dense"
                                id="tel"
                                label="tel"
                                type="text"
                                required={true}
                                value={this.state.newFirm.tel}
                                onChange={(e) => this.updateNewFirm(e, 'tel')}
                                fullWidth
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" color="primary"
                                    onClick={() => this.handleAddDevice()}>
                                Add
                            </Button>
                            <Button onClick={() => this.handleClose('addDialog')} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
                <div>
                    <Button variant="contained" color="primary" disabled={!this.props.selected}
                            onClick={() => this.handleClickOpen('confirmDeleteDialog')}>
                        Delete
                    </Button>
                    <Dialog
                        open={this.state.confirmDeleteDialog}
                        onClose={() => this.handleClose('confirmDeleteDialog')}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title-">Device properties</DialogTitle>
                        <DialogContent>
                            Confirm deletion of {this.props.selected ? this.props.selected.email : ''}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => this.handleClose('confirmDeleteDialog')} color="primary">
                                Close
                            </Button>
                            <Button disabled={!this.props.selected} variant="contained" color="secondary"
                                    onClick={() => this.handleDeleteDevice()}>
                                Confirm
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

const UserToolBarComponent = connect(null, mapDispatchToProps)(UserToolBar);

class UserTableHead extends React.Component {
    createSortHandler = property => event => {
        this.props.onRequestSort(event, property);
    };

    render() {
        const {order, orderBy} = this.props;

        return (
            <TableHead>
                <TableRow>
                    <TableCell>
                        Select
                    </TableCell>
                    {rows.map(
                        row => (
                            <TableCell
                                key={row.id}
                                align={row.numeric ? 'right' : 'left'}
                                padding={row.disablePadding ? 'none' : 'default'}
                                sortDirection={orderBy === row.id ? order : false}
                            >
                                <Tooltip
                                    title="Sort"
                                    placement={row.numeric ? 'bottom-end' : 'bottom-start'}
                                    enterDelay={300}
                                >
                                    <TableSortLabel
                                        active={orderBy === row.id}
                                        direction={order}
                                        onClick={this.createSortHandler(row.id)}
                                    >
                                        {row.label}
                                    </TableSortLabel>
                                </Tooltip>
                            </TableCell>
                        ),
                        this,
                    )}
                </TableRow>
            </TableHead>
        );
    }
}

UserTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

const userTableToolbarStyles = theme => ({
    root: {
        paddingRight: theme.spacing.unit,
    },
    highlight:
        theme.palette.type === 'light'
            ? {
                color: theme.palette.secondary.main,
                backgroundColor: lighten(theme.palette.secondary.light, 0.85),
            }
            : {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.secondary.dark,
            },
    spacer: {
        flex: '1 1 100%',
    },
    actions: {
        color: theme.palette.text.secondary,
    },
    title: {
        flex: '0 0 auto',
    },
});

let UserTableToolbar = props => {
    const {numSelected, classes, selectedUser} = props;

    return (
        <Toolbar
            className={classNames(classes.root, {
                [classes.highlight]: numSelected > 0,
            })}
        >
            <div className={classes.title}>
                {numSelected > 0 ? (
                    <Typography color="inherit" variant="subtitle1">
                        {selectedUser.name} selected
                    </Typography>
                ) : (
                    <Typography variant="h6" id="tableTitle">
                        Users
                    </Typography>
                )}
            </div>
            <div className={classes.spacer}/>
            <div className={classes.actions}>
                {numSelected > 0 ? (
                    <Tooltip title="Delete">
                        <IconButton aria-label="Delete">
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title="Filter list">
                        <IconButton aria-label="Filter list">
                            <FilterListIcon/>
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        </Toolbar>
    );
};

UserTableToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    selectedUser: PropTypes.object,
};

UserTableToolbar = withStyles(userTableToolbarStyles)(UserTableToolbar);

const styles = theme => ({
    root: {
        width: '100%',
        marginTop: theme.spacing.unit * 3,
    },
    table: {
        minWidth: 1020,
    },
    tableWrapper: {
        overflowX: 'auto',
        position: 'relative',
        top: 0,
        left: 0
    },
});

class UserAdminComponent extends React.Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            order: 'asc',
            orderBy: 'id',
            selected: [],
            data: [],
            page: 0,
            rowsPerPage: 5,
            selectedUser: null,
            loading: false,
            selectedFirm: null,
        };

        this.handleUserSelect = this.handleUserSelect.bind(this);
        this.resetSelected = this.resetSelected.bind(this);
    }


    componentWillMount() {
        let data = [];
        if (this.props.parentUsers) {
            this.props.parentUsers.map(record => {
                let row = [
                    record.email,
                    record.name,
                ];
                data.push(createData(...row));
                const obj = {
                    order: this.state.order,
                    orderBy: this.state.orderBy,
                    selected: [],
                    data,
                    page: this.state.page,
                    rowsPerPage: this.state.rowsPerPage
                };
                this.setState(obj);
            })
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(this.props.selectedFirm._id);
            } else this.setState({users: this.props.parentUsers});
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(selectedFirm._id);
            } else this.setState({users: this.props.parentUsers});
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().userReducer.loading});
            if (store.getState().userReducer.users) {
                const users = store.getState().userReducer.users;
                this.setState({users});
                this.props.handleSetUsers(users);
                let data = [];
                const reduxUsers = store.getState().userReducer.users;
                reduxUsers.map(record => {
                    let row = [
                        record.email,
                        record.name,
                    ];
                    data.push(createData(...row));
                    const obj = {
                        order: this.state.order,
                        orderBy: this.state.orderBy,
                        selected: [],
                        data,
                        page: this.state.page,
                        rowsPerPage: this.state.rowsPerPage
                    };
                    this.setState(obj);
                })
            }
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    handleUserSelect(user) {
        this.props.onUserSelect(user);
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';

        if (this.state.orderBy === property && this.state.order === 'desc') {
            order = 'asc';
        }

        this.setState({order, orderBy});
    };

    resetSelected = () => {
        this.setState({selected: [], selectedUser: null});
    };

    handleClick = (event, email) => {
        const {selected} = this.state;
        const selectedIndex = selected.indexOf(email);
        let newSelected = [];
        let selectedUser = null;
        if (selectedIndex === -1) {
            newSelected.push(email);
            selectedUser = this.state.users.filter(el => el.email === email ? el : null)[0];
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        }
        this.setState({selected: newSelected, selectedUser});
        this.handleUserSelect(selectedUser);
    };

    handleChangePage = (event, page) => {
        this.setState({page});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: event.target.value});
    };

    isSelected = id => this.state.selected.indexOf(id) !== -1;

    render() {
        const {classes} = this.props;
        const {data, order, orderBy, selected, rowsPerPage, page, selectedUser, loading, selectedFirm} = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
        return (
            <Paper className={classes.root}>
                <UserTableToolbar numSelected={selected.length} selectedUser={selectedUser}/>
                <UserToolBarComponent
                    selected={selectedUser}
                    loading={loading}
                    resetSelected={() => this.resetSelected()}
                    selectedFirmId={selectedFirm ? selectedFirm._id : ''}
                />
                {loading && <LinearProgress color="secondary"/>}
                <div className={classes.tableWrapper}>
                    <Table className={classes.table} aria-labelledby="tableTitle">
                        <UserTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={this.handleRequestSort}
                            rowCount={data.length}
                        />
                        <TableBody>
                            {stableSort(data, getSorting(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map(n => {
                                    const isSelected = this.isSelected(n.email);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={event => this.handleClick(event, n.email)}
                                            role="checkbox"
                                            aria-checked={isSelected}
                                            tabIndex={-1}
                                            key={n.email}
                                            selected={isSelected}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected}/>
                                            </TableCell>
                                            <TableCell align="right" key={n.email}>{n.email}</TableCell>
                                            <TableCell align="right" key={n.name}>{n.name}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            {emptyRows > 0 && (
                                <TableRow style={{height: 49 * emptyRows}}>
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    backIconButtonProps={{
                        'aria-label': 'Previous Page',
                    }}
                    nextIconButtonProps={{
                        'aria-label': 'Next Page',
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                />
            </Paper>
        )
    }
}

UserAdminComponent.propTypes = {
    selectedFirm: PropTypes.object,
    onUserSelect: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    resetSelectedUserParent: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);
