import React from "react";
import * as PropTypes from 'prop-types';
import _ from "lodash";

// Material
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../material/table-styles';
import {Grid} from "@material-ui/core";

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
import MaterialTable from '../material/MaterialTable/material-table';
import UserToolBarComponent from './UserToolBarComponent';

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

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            page: 0,
            rowsPerPage: 5,
            selectedUsers: [],
            selectedUserIds: [],
            loading: false,
            selectedFirm: null,
            columns: [
                {
                    title: 'Select',
                    field: 'action',
                    filtering: false,
                    sorting: false,
                    hidden: false,
                },
                {
                    title: 'Name',
                    field: 'name',
                    hidden: false,
                },
                {title: 'Surname', field: 'surname', hidden: false,},
                {title: 'Email', field: 'email', hidden: false,},
                {title: 'tel', field: 'tel', hidden: false,},
            ]
        };

        this.handleUsersSelect = this.handleUsersSelect.bind(this);
        this.resetSelected = this.resetSelected.bind(this);
        this.addRemoveColumn = this.addRemoveColumn.bind(this);
    }


    componentDidMount() {
        this._isMounted = true;
        this.setState({loading: true});
        if (this.props.selectedFirm) {
            this.setState({selectedFirm: this.props.selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(this.props.selectedFirm._id);
            } else this.setState({users: this.props.parentUsers, loading: false});
        } else {
            let selectedFirm = tokenService.verifyToken().firm;
            this.setState({selectedFirm});
            if (!this.props.parentUsers) {
                this.props.usersRequest(selectedFirm._id);
            } else this.setState({users: this.props.parentUsers, loading: false});
        }


        if (this.props.selectedUsers) {
            const selectedUsers = this.props.selectedUsers;
            const selectedUserIds = selectedUsers.map(user=>user._id);
            this.setState({selectedUsers, selectedUserIds});
        }
        if (this.props.parentUsers) {
            this.setState({users: this.props.parentUsers});
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
        this._isMounted = false;
        this.unsubscribe();
    }

    handleUsersSelect(users) {
        this.props.onUsersSelect(users);
    }

    resetSelected = () => {
        this.setState({selectedUsers: [], selectedUserIds: []});
    };

    onRowClick = (e, rowData) => {
        const {selectedUsers} = this.state;
        let usersSet = new Set(selectedUsers);
        usersSet.has(rowData) ? usersSet.delete(rowData) : usersSet.add(rowData);
        const selectedUserIds = [...usersSet].map(el=>el._id);
        this.setState({selectedUsers: [...usersSet], selectedUserIds});
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    render() {
        const {rowsPerPage, page, selectedUsers, selectedUserIds, loading, selectedFirm, users, columns} = this.state;
        users && users.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedUserIds.includes(el._id)} />
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
                                            <UserToolBarComponent
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
                                isLoading={loading}
                                data={users}
                                columns={columns}
                                title="Firms"
                                options={{
                                    filtering: true,
                                    columnsButton: false,
                                    header: true,
                                    initialPage: page,
                                    pageSize: rowsPerPage,
                                    search: false,
                                    toolbar: true
                                }}
                                onRowClick={this.onRowClick}
                            />
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
    classes: PropTypes.object.isRequired,
    resetSelectedUserParent: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array,
    selectedUser: PropTypes.object,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);
