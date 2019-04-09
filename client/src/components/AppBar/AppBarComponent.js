import React from "react";
import PropTypes from 'prop-types';

// Material
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Button from "@material-ui/core/Button";

// Components
import HomeComponent from '../../components/Home/HomeComponent';
import FirmAdminComponent from '../../components/FirmAdministration/FirmAdminComponent';
import UserAdminComponent from '../../components/UserAdministration/UserAdminComponent';
import DeviceAdminComponent from '../../components/DeviceAdministration/DeviceAdminComponent';


function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

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

class ScrollableTabsButtonAuto extends React.Component {
    state = {
        value: 0,
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Toolbar>
                        <div className="logo">
                            <img
                                src="http://bitstream.pl/wp-content/uploads/2018/03/Logo-Bitstream-4-01.png"
                                alt=""/>
                        </div>
                        <Tabs
                            value={value}
                            onChange={this.handleChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab label="Home" />
                            <Tab label="Firms" />
                            <Tab label="Users" />
                            <Tab label="Devices" />
                            <Tab label="Visualisation" />
                            <Tab label="Optional" />
                        </Tabs>
                        <Button>Login</Button>
                    </Toolbar>
                </AppBar>
                {value === 0 && <TabContainer><HomeComponent /></TabContainer>}
                {value === 1 && <TabContainer><FirmAdminComponent /></TabContainer>}
                {value === 2 && <TabContainer><UserAdminComponent /></TabContainer>}
                {value === 3 && <TabContainer><DeviceAdminComponent /></TabContainer>}
                {value === 4 && <TabContainer>Visualisation</TabContainer>}
                {value === 5 && <TabContainer>Optional</TabContainer>}
            </div>
        );
    }
}

ScrollableTabsButtonAuto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScrollableTabsButtonAuto);
