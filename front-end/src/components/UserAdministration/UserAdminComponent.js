import React from 'react';
import ReactDOM from 'react-dom';
import * as PropTypes from 'prop-types';
import _ from 'lodash';

// Material
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import {styles} from '../UI/material/table-styles';
import {Grid} from '@material-ui/core';
import MaterialTable from 'material-table';
import AddBoxIcon from '@material-ui/icons/AddBox';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

// Redux
import store from '../../redux/store';
import {connect} from 'react-redux';
import {
    usersRequest,
    addUserRequest,
    deleteUserRequest,
    updateUserRequest,
    changePassAdminRequest,
    changeEmailAdminRequest
} from '../../redux/actions';
import {tokenService} from '../../services/token.service';

// Components
import './UserAdmin.scss';
import UserToolBar from './UserToolBar';

// Services
import {mixedService} from '../../redux/services/mixed';
import {buildFirmInfo} from './chart.service';

const theme = createMuiTheme({
    palette: {
        type: 'light'
    },
    typography: {
        useNextVariants: true,
    },
});

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

class UserAdminComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5,
            users: [],
            selectedUsers: [],
            selectedUserIds: [],
            loading: false,
            firmInfoLoading: false,
            selectedFirm: null,
            columns: [
                {
                    title: 'Select',
                    field: 'action',
                    filtering: false,
                    sorting: false,
                    hidden: false,
                },
                {title: 'Name', field: 'name', hidden: false,},
                {title: 'Surname', field: 'surname', hidden: false,},
                {title: 'Email', field: 'email', hidden: false,},
                {title: 'tel', field: 'tel', hidden: false,},
            ]
        };

        this.handleUsersSelect = this.handleUsersSelect.bind(this);
        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
        this.selectAllUsers = this.selectAllUsers.bind(this);
    }


    componentDidMount() {
        this.setState({loading: true});
        this.renderSelectAllCheckBox(false);
        let selectedFirm = null;
        if (this.props.selectedFirm) {
            selectedFirm = this.props.selectedFirm;
            this.setState({selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(selectedFirm._id);
            }
            else this.setState({users: this.props.parentUsers, loading: false});
        }
        else {
            selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(selectedFirm._id);
            }
            else {
                this.setState({users: this.props.parentUsers, loading: false});
            }
        }

        const storageFirmInfo = JSON.parse(localStorage.getItem('firmInfo'));
        if (!storageFirmInfo) {
            this.setState({firmInfoLoading: true});
            mixedService.getBasicFirmInfo(selectedFirm._id)
                .then(firmInfo => {
                    this.setState({firmInfoLoading: false});
                    buildFirmInfo(firmInfo);
                }).catch(e => this.setState({firmInfoLoading: false}));
        }
        else {
            buildFirmInfo(storageFirmInfo);
        }
        if (this.props.selectedUsers) {
            const {selectedUsers} = this.props;
            const selectedUserIds = selectedUsers.map(user => user._id);
            this.setState({selectedUsers, selectedUserIds});
            if (this.props.parentUsers.length === this.props.selectedUsers.length) {
                this.renderSelectAllCheckBox(false);
            }
            else {
                this.renderSelectAllCheckBox(true);
            }
        }

        this.unsubscribe = store.subscribe(() => {
            this.setState({loading: store.getState().userReducer.loading});
            if (store.getState().userReducer.users) {
                const users = store.getState().userReducer.users;
                this.setState({users});
                this.props.handleSetUsers(users);
            }
            return true;
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    handleUsersSelect(users) {
        this.props.onUsersSelect(users);
    }

    resetSelected = () => {
        this.props.resetSelectedUsers();
        this.setState({selectedUsers: [], selectedUserIds: []});
    };

    onRowClick = (e, rowData) => {
        const {users, selectedUserIds} = this.state;
        let selectedUser = _.omit(users.filter(el => (el._id === rowData._id) ? el : null)[0], 'action');
        let selectedUsersIdsSet = new Set(selectedUserIds);
        let id = selectedUser._id;
        selectedUsersIdsSet.has(id) ? selectedUsersIdsSet.delete(id) : selectedUsersIdsSet.add(id);
        let selectedUsers = [];
        [...selectedUsersIdsSet].forEach(id => {
            users.forEach(user => {
                if (user._id === id) {
                    selectedUsers.push(user);
                }
            })
        });
        let checked = false;
        if (selectedUsers.length === users.length) {
            checked = true;
            this.renderSelectAllCheckBox(checked);
        }
        else {
            this.renderSelectAllCheckBox(checked)
        }
        this.setState({selectedUsers, selectedUserIds: [...selectedUsersIdsSet]});
        this.handleUsersSelect(selectedUsers);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    selectAllUsers() {
        const {users, selectedUsers} = this.state;
        if (users.length === selectedUsers.length) {
            this.renderSelectAllCheckBox(false);
            this.resetSelected();
        }
        else {
            const selectedUserIds = users.map(user => user._id);
            this.setState({selectedUsers: users, selectedUserIds});
            this.renderSelectAllCheckBox(true);
            this.handleUsersSelect(users);
        }
    }

    renderSelectAllCheckBox(checked) {
        let element = <IconButton onClick={this.selectAllUsers}>
            {checked ? <CheckBoxIcon/> : <AddBoxIcon/>}
        </IconButton>;
        const container = document.querySelector('#root > div > main > div > div > div > div > div > div > div > ' +
            'div:nth-child(2) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(1)');
        if (container)
            ReactDOM.render(element, container)
    }

    render() {
        const {
            rowsPerPage, page, selectedUsers, selectedUserIds, loading,
            selectedFirm, users, columns, firmInfoLoading
        } = this.state;
        users && users.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedUserIds.includes(el._id)}/>
                </div>
            )
        }));
        return (
            <MuiThemeProvider theme={theme}>
                <div style={{maxWidth: '100%'}}>
                    <Grid container>
                        <Grid item xs={12}>
                            <MaterialTable
                                components={{
                                    Toolbar: props => (
                                        <div className={'custom-toolbar'}>
                                            <UserToolBar
                                                selected={selectedUsers.length === 1 ? selectedUsers[0] : null}
                                                resetSelected={this.resetSelected}
                                                loading={loading}
                                                selectedFirmId={selectedFirm ? selectedFirm._id : ''}
                                                users={users}
                                                addRemoveColumn={this.addRemoveColumn}
                                                columns={columns}
                                            />
                                        </div>
                                    ),
                                }}
                                title="Users"
                                // Todo: crash hole application
                                // isLoading={loading}
                                data={users}
                                columns={columns}
                                options={{
                                    filtering: true,
                                    columnsButton: false,
                                    header: true,
                                    initialPage: page,
                                    pageSize: rowsPerPage,
                                    search: false,
                                    toolbar: true,
                                }}
                                onRowClick={this.onRowClick}
                            />
                        </Grid>
                        <Grid item xs={12} className={'user-wrap'}>
                            <div className={'user-title'}>User devices</div>
                            {loading && <CircularProgress
                                style={{
                                    width: '250px',
                                    height: '250px',
                                    color: '#2196f3',
                                    position: "absolute",
                                    top: '35%',
                                    left: "43%",
                                    zIndex: 9999
                                }}
                            />}
                            <Paper className={'user-container'}>
                                {firmInfoLoading && <CircularProgress
                                    style={{
                                        width: '250px',
                                        height: '250px',
                                        color: '#2196f3',
                                        position: "absolute",
                                        top: '35%',
                                        left: "43%",
                                        zIndex: 9999
                                    }}
                                />}
                                <div id={'firm-info-chart'}></div>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </MuiThemeProvider>
        )
    }
}

UserAdminComponent.propTypes = {
    selectedFirm: PropTypes.object,
    onUsersSelect: PropTypes.func.isRequired,
    resetSelectedUsers: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array,
    selectedUsers: PropTypes.array,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);

