import React from "react";
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import FirmAdminComponent from '../../components/FirmAdministration/FirmAdminComponent';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import DeviceAdminComponent from '../../components/DeviceAdministration/DeviceAdminComponent';
import Toolbar from '@material-ui/core/Toolbar';

import {firmsRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import store from '../../redux/store'
import {checkAccess} from "../privateRoute";
import FirmDevicesComponent from "../FirmDevicesComponent/FirmDevicesComponent";

import './adminPanel.scss';

const mapDispatchToProps = (dispatch) => {
    return {
        firmRequest: () => dispatch(firmsRequest()),
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
        selectedFirm: null,
        selectedUser: null
    };

    constructor() {
        super();

        this.unsubscribe = store.subscribe(() => {
            if (store.getState().firmReducer.firms) {
                const reduxFirms = store.getState().firmReducer.firms;
                if (reduxFirms !== this.state.firms && this._isMounted) {
                    this.setState({firms: reduxFirms})
                }
            }
        });

        this.handleFirmSelect = this.handleFirmSelect.bind(this);
        this.resetSelectedFirm = this.resetSelectedFirm.bind(this);
        this.handleUserSelect = this.handleUserSelect.bind(this);
        this.resetSelectedUser = this.resetSelectedUser.bind(this);
        this.handleSetUsers = this.handleSetUsers.bind(this);
    }

    _isMounted = false;

    handleFirmSelect(selectedFirm) {
        if (this._isMounted) {
            this.setState({selectedFirm})
        }
    }

    handleUserSelect(selectedUser) {
        if (this._isMounted) {
            this.setState({selectedUser})
        }
    }

    resetSelectedFirm() {
        if (this._isMounted) {
            this.setState({selectedFirm: null, users: null, selectedUser: null})
        }
    }

    resetSelectedUser() {
        if (this._isMounted) {
            this.setState({selectedUser: null})
        }
    }

    handleSetUsers(users) {
        if (this._isMounted) {
            this.setState({users});
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
        const {value, firms, selectedFirm, selectedUser, users} = this.state;
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
                            <FirmAdminComponent
                                resetSelectedParent={this.resetSelectedFirm}
                                firms={firms} onFirmSelect={this.handleFirmSelect}/>
                        </TabContainer>}
                        {value === 1 && <TabContainer>
                            <FirmDevicesComponent
                                selectedFirm={selectedFirm}/>
                        </TabContainer>}
                        {value === 2 && <TabContainer>
                            <UserAdminComponent
                                handleSetUsers={this.handleSetUsers}
                                resetSelectedUserParent={this.resetSelectedUser}
                                onUserSelect={this.handleUserSelect}
                                selectedFirm={selectedFirm}
                                parentUsers={users}
                            /></TabContainer>}
                        {value === 3 && <TabContainer><DeviceAdminComponent/></TabContainer>}
                        {value === 4 && <TabContainer>Visualisation</TabContainer>}
                        {value === 5 && <TabContainer>Optional</TabContainer>}
                    </div> :
                    <div>
                        {value === 0 && <TabContainer><FirmDevicesComponent/></TabContainer>}
                        {value === 1 && <TabContainer>
                            <UserAdminComponent
                                handleSetUsers={this.handleSetUsers}
                                resetSelectedUserParent={this.resetSelectedUser}
                                onUserSelect={this.handleUserSelect}
                                selectedFirm={selectedFirm}
                                parentUsers={users}
                            /></TabContainer>}
                        {value === 2 && <TabContainer>
                            <DeviceAdminComponent/>
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
