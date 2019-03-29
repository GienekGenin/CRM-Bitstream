import React from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

import FirmAdminComponent from '../../components/FirmAdministration/FirmAdminComponent';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import DeviceAdminComponent from '../../components/DeviceAdministration/DeviceAdminComponent';
import Toolbar from '@material-ui/core/Toolbar';

import {firmRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import store from '../../redux/store'
import {checkAccess} from "../privateRoute";
import FirmDevicesComponent from "../FirmDevicesComponent/FirmDevicesComponent";

const mapDispatchToProps = (dispatch) => {
    return {
        firmRequest: () => dispatch(firmRequest()),
    };
};

const mapStateToProps = state => {
    return {
        firms: state.firmReducer.firms,
        user: state.loginReducer.user
    };
};

const TabContainer = (props) => {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
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
        selectedFirm: null,
    };

    constructor(){
        super();

        this.handleFirmSelect = this.handleFirmSelect.bind(this);
    }

    _isMounted = false;

    handleFirmSelect(selectedFirm){
        if(this._isMounted){
            this.setState({selectedFirm})
        }
    }

    componentDidMount() {
        this._isMounted = true;

        this.props.firmRequest();
        this.unsubscribe = store.subscribe(()=>{
            if(store.getState().firmReducer.firms){
                const reduxFirms = store.getState().firmReducer.firms;
                if(reduxFirms !== this.state.firms && this._isMounted){
                    this.setState({firms: reduxFirms})
                }
            }
        });

    }

    componentWillUnmount() {
        this._isMounted = false;
        this.unsubscribe();
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value, firms, selectedFirm } = this.state;

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
                            <Tab label="Firms" disabled={!checkAccess('/editFirms')}/>
                            <Tab label="Firm devices" />
                            <Tab label="Users" disabled={!selectedFirm}/>
                            <Tab label="Devices" />
                            <Tab label="Visualisation" />
                            <Tab label="Optional" />
                        </Tabs>
                    </Toolbar>
                </AppBar>
                {value === 0 && <TabContainer><FirmAdminComponent firms={firms} onFirmSelect={this.handleFirmSelect}/></TabContainer>}
                {value === 1 && <TabContainer><FirmDevicesComponent /></TabContainer>}
                {value === 2 && <TabContainer><UserAdminComponent selectedFirm={selectedFirm}/></TabContainer>}
                {value === 3 && <TabContainer><DeviceAdminComponent /></TabContainer>}
                {value === 4 && <TabContainer>Visualisation</TabContainer>}
                {value === 5 && <TabContainer>Optional</TabContainer>}
            </div>
        );
    }
}

AdminPanel.propTypes = {
    classes: PropTypes.object.isRequired,
};

const AdminPanelWithStyles =  withStyles(styles)(AdminPanel);

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanelWithStyles);
