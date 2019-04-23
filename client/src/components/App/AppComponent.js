import React, {Component} from "react";
import {Router, Switch, Route, Link} from 'react-router-dom';
import {PrivateRoute} from "../privateRoute";
import PropTypes from 'prop-types';
import classNames from 'classnames';
// Material
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

// Redux
import {history} from '../../redux/services/history';
import {tokenService} from "../../redux/services/token";
import {setUser, logoutRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import {checkAccess} from "../privateRoute";

// Components
import './App.scss';
import LoginForm from '../Login/LoginForm';
import HomeComponent from "../Home/HomeComponent";
import AdminPanelComponent from "../AdminPanel/AdminPanelComponent";
import DashboardComponent from '../../components/Dashboard/DashboardComponent';
import {PopupComponent} from "../material/PopupComponent/PopupComponent";
import {SnackbarProvider} from "notistack";
import DeviceAdminComponent from "../DeviceAdministration/DeviceAdminComponent";
import {withStyles} from "@material-ui/core";


const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#757ce8',
            main: '#212121',
            dark: '#002884',
            contrastText: '#fff',
        },
        secondary: red,
        error: red,
        // Used by `getContrastText()` to maximize the contrast between the background and
        // the text.
        contrastThreshold: 3,
        // Used to shift a color's luminance by approximately
        // two indexes within its tonal palette.
        // E.g., shift from Red 500 to Red 300 or Red 700.
        tonalOffset: 0.2,
    },
    typography: {
        useNextVariants: true,
    },
});
const drawerWidth = 260;
const styles = theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginLeft: 12,
        marginRight: 36,
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        backgroundImage: `url('../../../public/static/image.png')`
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 1000,
        }),backgroundImage: `url('../../../public/static/image.png')`
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 1000,
        }),
        overflowX: 'hidden',
        width: theme.spacing.unit * 7 + 1,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9 + 1,
        },backgroundImage: `url('../../../public/static/image.png')`
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        overflow: 'scroll'
        // padding: theme.spacing.unit * 3,
    },
});

const mapDispatchToProps = (dispatch) => {
    return {
        logoutRequest: () => dispatch(logoutRequest()),
        setUser: (user) => dispatch(setUser(user))
    };
};

const mapStateToProps = state => {
    return {user: state.loginReducer.user};
};

class AppComponent extends Component {

    state = {
        open: false,
    };

    handleDrawerOpen = () => {
        this.setState({ open: true });
    };

    handleDrawerClose = () => {
        this.setState({ open: false });
    };

    componentWillMount() {
        if (tokenService.verifyToken()) {
            const {user, firm} = tokenService.verifyToken();
            this.props.setUser({user, firm});
        }
    }

    render() {
        const { classes, theme } = this.props;
        const {user} = this.props;
        return (
            <Router history={history}>
                <div className={'root'}>
                    <div id={'tests'}>
                        <Drawer
                            variant="permanent"
                            className={classNames(classes.drawer, {
                                [classes.drawerOpen]: this.state.open,
                                [classes.drawerClose]: !this.state.open,
                            })}
                            classes={{
                                paper: classNames({
                                    [classes.drawerOpen]: this.state.open,
                                    [classes.drawerClose]: !this.state.open,
                                }),
                            }}
                            open={this.state.open}
                        >
                            {this.state.open && <div className={classes.toolbar}>
                                <IconButton onClick={this.handleDrawerClose}>
                                    {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                                </IconButton>
                            </div>}
                            {!this.state.open && <Toolbar disableGutters={!this.state.open}>
                                <IconButton
                                    color="inherit"
                                    aria-label="Open drawer"
                                    onClick={this.handleDrawerOpen}
                                    className={classNames(classes.menuButton, {
                                        [classes.hide]: this.state.open,
                                    })}
                                >
                                    <MenuIcon />
                                </IconButton>
                            </Toolbar>}
                            <Divider />
                            <List>
                                <ListItem >
                                    <Typography variant="h6" color="inherit">
                                        <Link to={'/'}><Button color="inherit"> Home </Button></Link>
                                    </Typography>
                                </ListItem>
                                <ListItem>
                                    {checkAccess('/dashboard') && <Typography variant="h6" color="inherit">
                                        <Link to={'/dashboard'}><Button color="inherit"> Dashboard </Button></Link>
                                    </Typography>}
                                </ListItem>
                                <ListItem>
                                    {checkAccess('/dashboard') && <Typography variant="h6" color="inherit">
                                        <Link to={'/dashboard'}><Button color="inherit"> Dashboard </Button></Link>
                                    </Typography>}
                                </ListItem>
                                <ListItem>
                                    {checkAccess('/admin_panel') && <Typography variant="h6" color="inherit">
                                        <Link to={'/admin_panel'}><Button color="inherit"> Admin Panel </Button></Link>
                                    </Typography>}
                                </ListItem>
                                <ListItem>
                                    {checkAccess('/devices') && <Typography variant="h6" color="inherit">
                                        <Link to={'/devices'}><Button color="inherit"> devices </Button></Link>
                                    </Typography>}
                                </ListItem>
                                <ListItem>
                                    {user ? <Button color="inherit" onClick={this.props.logoutRequest}><Link
                                            to={'/login'}>Logout</Link></Button> :
                                        <Link to={'/login'}><Button color="inherit">Login</Button></Link>}
                                </ListItem>
                            </List>
                        </Drawer>
                    </div>
                    <main className={classes.content}>
                        <MuiThemeProvider theme={theme}>
                                <Switch history={history}>
                                    <Route exact path='/' component={HomeComponent}/>
                                    <PrivateRoute exact path='/admin_panel' component={AdminPanelComponent}/>
                                    <PrivateRoute exact path='/dashboard' component={DashboardComponent}/>
                                    <PrivateRoute exact path='/devices' component={DeviceAdminComponent}/>
                                    <Route exact path='/login' component={LoginForm}/>
                                </Switch>
                                <SnackbarProvider maxSnack={5}>
                                    <PopupComponent/>
                                </SnackbarProvider>
                        </MuiThemeProvider>

                    </main>
                </div>
            </Router>)
    }
}

AppComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default withStyles(styles, { withTheme: true })(App);
