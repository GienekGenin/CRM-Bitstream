import React from "react";
import * as PropTypes from 'prop-types';

// Material
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import {styles} from '../UI/material/table-styles';
import {Grid} from "@material-ui/core";
import MaterialTable from 'material-table';

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
                {title: 'Name', field: 'name', hidden: false,},
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
            const {selectedUsers} = this.props;
            const selectedUserIds = selectedUsers.map(user => user._id);
            this.setState({selectedUsers, selectedUserIds});
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
        this.props.resetSelectedUsers();
        this.setState({selectedUsers: [], selectedUserIds: []});
    };

    onSelectionChange = (rows) => {
        const selectedUserIds = rows.map(el => el._id);
        this.setState({selectedUsers: rows, selectedUserIds});
        this.handleUsersSelect(rows);
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    render() {
        const {rowsPerPage, page, selectedUsers, loading, selectedFirm, users, columns} = this.state;
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
                                    selection: true
                                }}
                                onSelectionChange={this.onSelectionChange}
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
    resetSelectedUsers: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array,
    selectedUsers: PropTypes.array,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);

