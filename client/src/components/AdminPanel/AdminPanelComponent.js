import React from "react";
import PropTypes from 'prop-types';

// Material
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';

// Redux
import {firmsRequest, usersRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import store from '../../redux/store'
import {checkAccess} from "../privateRoute";

// Components
import './adminPanel.scss';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import DeviceAdminComponent from '../../components/DeviceAdministration/DeviceAdminComponent';
import FirmDevicesComponent from "../FirmDevicesComponent/FirmDevicesComponent";
import TestComponent from "../Test/TestComponent";

const mapDispatchToProps = (dispatch) => {
    return {
        firmRequest: () => dispatch(firmsRequest()),
        usersRequest: (firmId) => dispatch(usersRequest(firmId)),
    };
};

const mapStateToProps = state => {
    return {
        firms: state.firmReducer.firms,
    };
};

const TabContainer = (props) => {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
};

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
});

class AdminPanel extends React.Component {

    state = {
        value: 0,
        firms: null,
        users: null,
        devices: null,
        userDevices: null,
        selectedFirm: null,
        selectedUser: null,
        selectedDevice: null,
        selectedUserDevice: null,
    };

    constructor() {
        super();

        this.unsubscribe = store.subscribe(() => {
            if (store.getState().firmReducer.firms) {
                const reduxFirms = store.getState().firmReducer.firms;
                if (reduxFirms !== this.state.firms && this._isMounted) {
                    this.setState({
                        firms: reduxFirms,
                        users: null,
                        devices: null,
                        userDevices: null,
                        selectedFirm: null,
                        selectedUser: null,
                        selectedDevice: null,
                        selectedUserDevice: null,})
                }
            }
            if(store.getState().devicesReducer.devices){
                const reduxDevices = store.getState().devicesReducer.devices;
                this.setState({devices: reduxDevices, selectedDevice: null});
            }
        });

        this.handleFirmSelect = this.handleFirmSelect.bind(this);
        this.handleUserSelect = this.handleUserSelect.bind(this);
        this.resetSelectedUser = this.resetSelectedUser.bind(this);
        this.handleSetUsers = this.handleSetUsers.bind(this);

        this.handleDeviceSelect = this.handleDeviceSelect.bind(this);
        this.resetSelectedDevice = this.resetSelectedDevice.bind(this);
        this.handleSetDevices = this.handleSetDevices.bind(this);

        this.handleUserDeviceSelect = this.handleUserDeviceSelect.bind(this);
        this.resetSelectedUserDevice = this.resetSelectedUserDevice.bind(this);
        this.handleSetUserDevices = this.handleSetUserDevices.bind(this);
    }

    _isMounted = false;

    handleFirmSelect(selectedFirm) {
        if (this._isMounted) {
            this.setState({
                selectedFirm,
                users: null,
                devices: null,
                userDevices: null,
                selectedUser: null,
                selectedDevice: null,
                selectedUserDevice: null,
            });
        }
    }

    handleUserSelect(selectedUser) {
        if (this._isMounted) {
            this.setState({selectedUser, selectedUserDevice: null, userDevices:null})
        }
    }

    handleDeviceSelect(selectedDevice) {
        if (this._isMounted) {
            this.setState({selectedDevice})
        }
    }

    handleUserDeviceSelect(selectedUserDevice) {
        if (this._isMounted) {
            this.setState({selectedUserDevice})
        }
    }

    resetSelectedUser() {
        if (this._isMounted) {
            this.setState({selectedUser: null, selectedUserDevice: null, userDevices:null })
        }
    }

    resetSelectedDevice() {
        if (this._isMounted) {
            this.setState({selectedDevice: null})
        }
    }

    resetSelectedUserDevice() {
        if (this._isMounted) {
            this.setState({selectedUserDevice: null})
        }
    }

    handleSetUsers(users) {
        if (this._isMounted) {
            this.setState({users, selectedUser: null, selectedUserDevice: null, userDevices:null});
        }
    }

    handleSetDevices(devices) {
        if (this._isMounted) {
            this.setState({devices, selectedDevice: null,});
        }
    }

    handleSetUserDevices(userDevices) {
        if (this._isMounted) {
            this.setState({userDevices, selectedUserDevice: null,});
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (checkAccess('/editFirms')) {
            this.props.firmRequest();
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    render() {
        const {classes} = this.props;
        const {value, firms, selectedFirm, selectedUser, selectedDevice, selectedUserDevice, userDevices, users, devices} = this.state;
        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            {checkAccess('/editFirms') && <Tab label="Firms"/>}
                            <Tab label="Firm devices" disabled={!selectedFirm && checkAccess('/editFirms')}/>
                            <Tab label="Users" disabled={!selectedFirm && checkAccess('/editFirms')}/>
                            <Tab label="Devices" disabled={!selectedUser}/>
                            <Tab label="Visualisation"/>
                            <Tab label="Optional"/>
                        </Tabs>
                    </Toolbar>
                </AppBar>
                {checkAccess('/editFirms') ?
                    <div>
                        {value === 0 && firms && <TabContainer>
                            <TestComponent
                                firms={firms}
                                onFirmSelect={this.handleFirmSelect}
                                selectedFirm={selectedFirm}
                            />
                        </TabContainer>}
                        {value === 1 && <TabContainer>
                            <FirmDevicesComponent
                                handleSetDevices={this.handleSetDevices}
                                resetSelectedDeviceParent={this.resetSelectedDevice}
                                onDeviceSelect={this.handleDeviceSelect}
                                selectedFirm={selectedFirm}
                                parentDevices={devices}
                                selectedDevice={selectedDevice}
                            />
                        </TabContainer>}
                        {value === 2 && <TabContainer>
                            <UserAdminComponent
                                handleSetUsers={this.handleSetUsers}
                                resetSelectedUserParent={this.resetSelectedUser}
                                onUserSelect={this.handleUserSelect}
                                selectedFirm={selectedFirm}
                                selectedUser={selectedUser}
                                parentUsers={users}
                            />
                        </TabContainer>}
                        {value === 3 && <TabContainer>
                            <DeviceAdminComponent
                                handleSetUserDevices={this.handleSetUserDevices}
                                resetSelectedUserDeviceParent={this.resetSelectedUserDevice}
                                onUserDeviceSelect={this.handleUserDeviceSelect}
                                selectedUserDevice={selectedUserDevice}
                                selectedUser={selectedUser}
                                parentUserDevices={userDevices}
                                parentUsers={users}
                            />
                        </TabContainer>}
                        {value === 4 && <TabContainer>Visualisation</TabContainer>}
                        {value === 5 && <TabContainer>Optional</TabContainer>}
                    </div> :
                    <div>
                        {value === 0 && <TabContainer>
                            <FirmDevicesComponent
                                handleSetDevices={this.handleSetDevices}
                                resetSelectedDeviceParent={this.resetSelectedDevice}
                                onDeviceSelect={this.handleDeviceSelect}
                                selectedFirm={selectedFirm}
                                parentDevices={devices}
                                selectedDevice={selectedDevice}
                            />
                        </TabContainer>}
                        {value === 1 && <TabContainer>
                            <UserAdminComponent
                                handleSetUsers={this.handleSetUsers}
                                resetSelectedUserParent={this.resetSelectedUser}
                                onUserSelect={this.handleUserSelect}
                                selectedFirm={selectedFirm}
                                selectedUser={selectedUser}
                                parentUsers={users}
                            /></TabContainer>}
                        {value === 2 && <TabContainer>
                            <DeviceAdminComponent
                                handleSetUserDevices={this.handleSetUserDevices}
                                resetSelectedUserDeviceParent={this.resetSelectedUserDevice}
                                onUserDeviceSelect={this.handleUserDeviceSelect}
                                selectedUserDevice={selectedUserDevice}
                                selectedUser={selectedUser}
                                parentUserDevices={userDevices}
                                parentUsers={users}
                            />
                        </TabContainer>}
                        {value === 3 && <TabContainer>Visualisation</TabContainer>}
                        {value === 4 && <TabContainer>Optional</TabContainer>}
                    </div>}

            </div>
        );
    }
}

AdminPanel.propTypes = {
    classes: PropTypes.object.isRequired,
};

const AdminPanelWithStyles = withStyles(styles)(AdminPanel);

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanelWithStyles);
