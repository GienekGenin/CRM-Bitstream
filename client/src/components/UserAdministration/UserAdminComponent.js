import React from "react";
import * as PropTypes from 'prop-types';

// Material
import {createMuiTheme, MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import Checkbox from "@material-ui/core/Checkbox";
import {styles} from '../material/table-styles';

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
import {Grid} from "@material-ui/core";
import MaterialTable from '../material/MaterialTable/material-table';
import UserToolBarComponent from './UserToolBarComponent';
import _ from "lodash";

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
            selectedUser: null,
            selectedUserId: '',
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

        this.handleUserSelect = this.handleUserSelect.bind(this);
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


        if (this.props.selectedUser) {
            this.setState({selectedUser: this.props.selectedUser});
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

    handleUserSelect(user) {
        this.props.onUserSelect(user);
    }

    resetSelected = () => {
        this.setState({selected: [], selectedUser: null});
    };

    onRowClick = (e, rowData) => {
        let selectedUser = _.omit(this.props.users.filter(el => (el._id === rowData._id) ? el : null)[0], 'action');
        if (this.state.selectedUser && this.state.selectedUser._id === selectedUser._id) {
            this.setState({selectedUser: null, selectedUserId: ''});
            this.props.onUserSelect(null);
        } else {
            this.setState({selectedUser, selectedUserId: selectedUser._id});
            this.props.onUserSelect(selectedUser);
        }
    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    render() {
        const {rowsPerPage, page, selectedUser, selectedUserId, loading, selectedFirm, users, columns} = this.state;
        users && users.map((el, i, arr) => arr[i] = Object.assign(el, {
            action: (
                <div>
                    <Checkbox value={el._id} checked={selectedUserId === el._id} />
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
                                                selected={selectedUser}
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
    onUserSelect: PropTypes.func.isRequired,
    classes: PropTypes.object.isRequired,
    resetSelectedUserParent: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array,
    selectedUser: PropTypes.object,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);
