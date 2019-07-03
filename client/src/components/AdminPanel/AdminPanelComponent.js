import React from "react";
import PropTypes from 'prop-types';

// Material
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Toolbar from '@material-ui/core/Toolbar';
import {TabContainer} from "../UI/material/TabContainer/TabContainer";

// Redux
import {firmsRequest, usersRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import store from '../../redux/store'
import {checkAccess} from "../privateRoute";

// Components
import './AdminPanel.scss';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import FirmDevicesComponent from "../FirmDevices/FirmDevicesComponent";
import FirmAdministrationComponent from "../FirmAdministration/FirmAdministrationComponent";
import VisualisationComponent from '../Visualisation/VisualisationComponent';
import {deviceTypesService} from "../../redux/services/device_types";
import {tokenService} from "../../redux/services/token";


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
        selectedUsers: null,
        selectedDevice: null,
        selectedUsersDevice: null,
        level: null
    };

    constructor() {
        super();

        this.unsubscribe = store.subscribe(() => {
            if (store.getState().firmReducer.firms) {
                const reduxFirms = store.getState().firmReducer.firms;
                if (reduxFirms !== this.state.firms) {
                    this.setState({
                        firms: reduxFirms,
                        users: null,
                        devices: null,
                        userDevices: null,
                        selectedFirm: null,
                        selectedUser: null,
                        selectedDevice: null,
                        selectedUserDevice: null,
                    })
                }
            }
            if (store.getState().devicesReducer.devices) {
                const reduxDevices = store.getState().devicesReducer.devices;
                if (!this.state.devices)
                    if (this.state.devices && reduxDevices.length !== this.state.devices.length) {
                        this.setState({devices: reduxDevices, selectedDevice: null});
                    }
            }
        });

        this.handleFirmSelect = this.handleFirmSelect.bind(this);
        this.handleUsersSelect = this.handleUsersSelect.bind(this);
        this.resetSelectedUsers = this.resetSelectedUsers.bind(this);
        this.handleSetUsers = this.handleSetUsers.bind(this);

        this.handleDevicesSelect = this.handleDevicesSelect.bind(this);
        this.resetSelectedDevices = this.resetSelectedDevices.bind(this);
        this.handleSetDevices = this.handleSetDevices.bind(this);
    }

    handleFirmSelect(selectedFirm) {
        this.setState({
            selectedFirm,
            users: null,
            devices: null,
            selectedUsers: null,
            selectedDevices: null,
        });
    }

    handleUsersSelect(selectedUsers) {
        this.setState({selectedUsers, selectedDevices: null, devices: null});
    }

    handleDevicesSelect(selectedDevices) {
        this.setState({selectedDevices});
    }

    resetSelectedUsers() {
        this.setState({selectedUsers: null, selectedDevices: null, devices: null});
    }

    resetSelectedDevices() {
        this.setState({selectedDevices: null});
    }

    handleSetUsers(users) {
        this.setState({users, selectedUsers: null, selectedDevices: null, devices: null});
    }

    handleSetDevices(devices) {
        this.setState({devices, selectedDevices: null,});
    }

    userLevel() {
        let level;
        if (checkAccess('/editFirms')) {
            level = 'SuperAdmin';
        } else if (checkAccess('/users')) {
            level = 'FirmAdmin';
            const decoded = tokenService.verifyToken();
            if (decoded) {
                this.setState({selectedFirm: decoded.firm});
            }
        } else if ('/firmDevices') {
            level = 'User';
            const decoded = tokenService.verifyToken();
            if (decoded) {
                this.setState({selectedUsers: [decoded.user]});
            }
        }
        this.setState({level});
    }

    componentDidMount() {
        this.userLevel();
        if (checkAccess('/editFirms')) {
            this.props.firmRequest();
        }
        localStorage.removeItem('chartData');
        deviceTypesService.getDeviceTypes().then(deviceTypes => {
            this.setState({deviceTypes});
        }).catch(e => console.log(e));
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    render() {
        const {
            value, firms, selectedFirm, selectedUsers, selectedDevices,
            users, devices, deviceTypes, level
        } = this.state;
        return (
            <div className={'admin-panel'}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        {level === 'SuperAdmin' &&
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="on"
                        >
                            <Tab label="Firms"/>
                            <Tab label="Users" disabled={!selectedFirm}/>
                            <Tab label="Devices" disabled={!selectedUsers }/>
                            <Tab label="Visualisation" disabled={selectedDevices ? !selectedDevices.length : true}/>
                        </Tabs>
                        }
                        {level === 'FirmAdmin' &&
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="on"
                        >
                            <Tab label="Users" disabled={!selectedFirm}/>
                            <Tab label="Devices" disabled={!selectedUsers}/>
                            <Tab label="Visualisation" disabled={selectedDevices ? !selectedDevices.length : true}/>
                        </Tabs>
                        }
                        {level === 'User' &&
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="on"
                        >
                            <Tab label="Devices" disabled={!selectedUsers}/>
                            <Tab label="Visualisation" disabled={selectedDevices ? !selectedDevices.length : true}/>
                        </Tabs>
                        }
                    </Toolbar>
                </AppBar>
                {level === 'SuperAdmin' &&
                    <div>
                        {value === 0 && firms && <TabContainer>
                            <FirmAdministrationComponent
                                firms={firms}
                                onFirmSelect={this.handleFirmSelect}
                                selectedFirm={selectedFirm}
                            />
                        </TabContainer>}
                        {value === 1 && <TabContainer>
                            <UserAdminComponent
                                handleSetUsers={this.handleSetUsers}
                                resetSelectedUsers={this.resetSelectedUsers}
                                onUsersSelect={this.handleUsersSelect}
                                selectedFirm={selectedFirm}
                                selectedUsers={selectedUsers}
                                parentUsers={users}
                            />
                        </TabContainer>}
                        {value === 2 && <TabContainer>
                            <FirmDevicesComponent
                                handleSetDevices={this.handleSetDevices}
                                resetSelectedDeviceParent={this.resetSelectedDevices}
                                onDeviceSelect={this.handleDevicesSelect}
                                selectedFirm={selectedFirm}
                                selectedUsers={selectedUsers}
                                parentDevices={devices}
                                selectedDevices={selectedDevices}
                                deviceTypes={deviceTypes}
                            />
                        </TabContainer>}
                        {value === 3 && <TabContainer>
                            <VisualisationComponent
                                selectedDevices={selectedDevices}
                                parentDevices={devices}
                            />
                        </TabContainer>}
                    </div>}
                {level === 'FirmAdmin' &&
                <div>
                    {value === 0 && <TabContainer>
                        <UserAdminComponent
                            handleSetUsers={this.handleSetUsers}
                            resetSelectedUsers={this.resetSelectedUsers}
                            onUsersSelect={this.handleUsersSelect}
                            selectedFirm={selectedFirm}
                            selectedUsers={selectedUsers}
                            parentUsers={users}
                        />
                    </TabContainer>}
                    {value === 1 && <TabContainer>
                        <FirmDevicesComponent
                            handleSetDevices={this.handleSetDevices}
                            resetSelectedDeviceParent={this.resetSelectedDevices}
                            onDeviceSelect={this.handleDevicesSelect}
                            selectedFirm={selectedFirm}
                            parentDevices={devices}
                            selectedDevices={selectedDevices}
                            selectedUsers={selectedUsers}
                            deviceTypes={deviceTypes}
                        />
                    </TabContainer>}
                    {value === 2 && <TabContainer>
                        <VisualisationComponent
                            selectedDevices={selectedDevices}
                            parentDevices={devices}
                        />
                    </TabContainer>}
                </div>
                }
                {level === 'User' &&
                <div>
                    {value === 0 && <TabContainer>
                        <FirmDevicesComponent
                            handleSetDevices={this.handleSetDevices}
                            resetSelectedDeviceParent={this.resetSelectedDevices}
                            onDeviceSelect={this.handleDevicesSelect}
                            selectedFirm={selectedFirm}
                            parentDevices={devices}
                            selectedDevices={selectedDevices}
                            selectedUsers={selectedUsers}
                            deviceTypes={deviceTypes}
                        />
                    </TabContainer>}
                    {value === 1 && <TabContainer>
                        <VisualisationComponent
                            selectedDevices={selectedDevices}
                            parentDevices={devices}
                        />
                    </TabContainer>}
                </div>
                }
            </div>
        );
    }
}

AdminPanel.propTypes = {
    classes: PropTypes.object.isRequired,
};

const AdminPanelWithStyles = withStyles(styles)(AdminPanel);

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanelWithStyles);
