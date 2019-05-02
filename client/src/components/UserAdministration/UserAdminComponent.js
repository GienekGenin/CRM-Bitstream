import React from "react";
import ReactDOM from 'react-dom'
import * as PropTypes from 'prop-types';

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
            checked: false,
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
        this.selectAllUsers = this.selectAllUsers.bind(this);
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
            const {selectedUsers, parentUsers} = this.props;
            let checked = false;
            if(parentUsers.length === selectedUsers.length){
                checked = true;
            }
            const selectedUserIds = selectedUsers.map(user => user._id);
            this.setState({selectedUsers, selectedUserIds, checked});
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
        this.setState({selectedUsers: [], selectedUserIds: [], checked: false});
    };

    onRowClick = (e, rowData) => {
        const {users, selectedUsers} = this.state;
        let usersSet = new Set(selectedUsers);
        usersSet.has(rowData) ? usersSet.delete(rowData) : usersSet.add(rowData);
        const selectedUserIds = [...usersSet].map(el => el._id);
        let checked = false;
        if(users.length === [...usersSet].length) {
            checked = true;
        }
        this.setState({selectedUsers: [...usersSet], selectedUserIds, checked});
        this.handleUsersSelect([...usersSet]);

    };

    addRemoveColumn = (columns) => {
        this.setState({columns});
    };

    selectAllUsers(){
        const {users, selectedUsers} = this.state;
        if(users.length === selectedUsers.length){
            this.resetSelected();
        } else {
            const selectedUserIds = users.map(user=>user._id);
            this.setState({selectedUsers: users, selectedUserIds, checked: true});
            this.handleUsersSelect(users);
        }
    }

    renderSelectAllCheckBox() {
        const {checked} = this.state;
        const element = <div>
            <Checkbox value={'1'} checked={ checked } onChange={this.selectAllUsers}/>
        </div>;
        const container = document.querySelector('#root > div.root > main > div > div > div > div > div > div > ' +
            'div > div:nth-child(2) > div > div > table > tbody > tr:nth-child(1) > td:nth-child(1)');
        if(container)
        ReactDOM.render(element, container)
    }

    render() {
        const {rowsPerPage, page, selectedUsers, selectedUserIds, loading, selectedFirm, users, columns} = this.state;
        this.renderSelectAllCheckBox();
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
                                title="Users"
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
    resetSelectedUsers: PropTypes.func,
    handleSetUsers: PropTypes.func,
    parentUsers: PropTypes.array,
    selectedUsers: PropTypes.array,
};

const UserAdminStyles = withStyles(styles)(UserAdminComponent);

export default connect(mapStateToProps, mapDispatchToProps)(UserAdminStyles);
