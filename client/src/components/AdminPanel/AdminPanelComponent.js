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
import '../App/AppComponent';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import FirmDevicesComponent from "../FirmDevices/FirmDevicesComponent";
import FirmAdministrationComponent from "../FirmAdministration/FirmAdministrationComponent";
import VisualisationComponent from '../Visualisation/VisualisationComponent';
import {deviceTypesService} from "../../redux/services/device_types";


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

    _isMounted = false;

    handleFirmSelect(selectedFirm) {
        if (this._isMounted) {
            this.setState({
                selectedFirm,
                users: null,
                devices: null,
                selectedUsers: null,
                selectedDevices: null,
            });
        }
    }

    handleUsersSelect(selectedUsers) {
        if (this._isMounted) {
            this.setState({selectedUsers, selectedDevices: null, devices: null})
        }
    }

    handleDevicesSelect(selectedDevices) {
        if (this._isMounted) {
            this.setState({selectedDevices})
        }
    }

    resetSelectedUsers() {
        if (this._isMounted) {
            this.setState({selectedUsers: null, selectedDevices: null, devices: null})
        }
    }

    resetSelectedDevices() {
        if (this._isMounted) {
            this.setState({selectedDevices: null})
        }
    }

    handleSetUsers(users) {
        if (this._isMounted) {
            this.setState({users, selectedUsers: null, selectedDevices: null, devices: null});
        }
    }

    handleSetDevices(devices) {
        if (this._isMounted) {
            this.setState({devices, selectedDevices: null,});
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (checkAccess('/editFirms')) {
            this.props.firmRequest();
        }
        deviceTypesService.getDeviceTypes().then(deviceTypes => {
            this.setState({deviceTypes});
        }).catch(e => console.log(e));
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    handleChange = (event, value) => {
        this.setState({value});
    };

    render() {
        const {
            value, firms, selectedFirm, selectedUsers, selectedDevices,
            users, devices, deviceTypes
        } = this.state;
        return (
            <div className={'admin-panel'}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="on"
                        >
                            {checkAccess('/editFirms') && <Tab label="Firms"/>}
                            <Tab label="Users" disabled={!selectedFirm && checkAccess('/editFirms')}/>
                            <Tab label="Devices" disabled={!selectedUsers && checkAccess('/editFirms')}/>
                            <Tab label="Visualisation" disabled={!selectedDevices}/>
                        </Tabs>
                    </Toolbar>
                </AppBar>
                {checkAccess('/editFirms') ?
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
                    </div> :
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
                                deviceTypes={deviceTypes}
                            />
                        </TabContainer>}
                        {value === 2 && <TabContainer>
                            <VisualisationComponent
                                selectedDevices={selectedDevices}
                                parentDevices={devices}
                            />
                        </TabContainer>}
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
