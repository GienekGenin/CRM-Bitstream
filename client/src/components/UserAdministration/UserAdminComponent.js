import React from "react";
import * as PropTypes from 'prop-types';

// Material
import Table from "@material-ui/core/Table";
import Paper from "@material-ui/core/Paper";
import TableBody from "@material-ui/core/TableBody";
import TablePagination from "@material-ui/core/TablePagination";
import {withStyles} from '@material-ui/core/styles';
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Checkbox from "@material-ui/core/Checkbox";
import LinearProgress from "@material-ui/core/LinearProgress";

// Redux
import store from "../../redux/store";
import {connect} from "react-redux";
import {
    usersRequest,
    addUserRequest,
    deleteUserRequest,
    updateUserRequest,
    changePassAdminRequest,
    changeEmailAdminRequest
} from "../../redux/actions";
import {tokenService} from "../../redux/services/token";

// Components
import './userAdmin.scss';
import UserToolBarComponent from './UserToolBarComponent';
import UserTableHead from './UserTableHead'
import UserTableToolbar from './UserTableToolbar'

// Table service
import {createData, stableSort, getSorting} from "./users-table.service";

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

const mapStateToProps = state => {
    return {
        users: state.userReducer.users,
    };
};

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

        let data = [];
        let selected = [];
        let selectedUser = null;
        if (this.props.selectedUser) {
            selected.push(this.props.selectedUser.email);
            selectedUser = this.props.selectedUser;
        }
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
                    selected,
                    selectedUser,
                    data,
                    page: this.state.page,
                    rowsPerPage: this.state.rowsPerPage
                };
                this.setState(obj);
                return true;
            })
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
                    return true;
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
    parentUsers: PropTypes.array,
    selectedUser: PropTypes.object,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);
