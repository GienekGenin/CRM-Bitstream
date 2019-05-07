import React, {Component} from "react";
import {Router, Switch, Route, Link} from 'react-router-dom';
import {PrivateRoute} from "../privateRoute";
import PropTypes from 'prop-types';
import classNames from 'classnames';
// Material
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {MuiThemeProvider} from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import HomeIcon from '@material-ui/icons/Home';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountIcon from '@material-ui/icons/AccountCircle';

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
import {PopupComponent} from "../UI/material/PopupComponent/PopupComponent";
import {SnackbarProvider} from "notistack";
import {withStyles} from "@material-ui/core";

const drawerWidth = 260;
const styles = theme => ({
        palette: {
            primary: {
                light: '#757ce8',
                main: '#212121',
                dark: '#002884',
                contrastText: '#fff',
            },
            secondary: '#e3f2fd',
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
        minWidth: 75,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        background: `url('https://pp.userapi.com/c852024/v852024335/10bfc4/Tj8lq3nMO-U.jpg') no-repeat right top`,
        backgroundSize: '300px 1100px',
    },
    drawerOpen: {
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 1000,
        }),
        background: `url('https://pp.userapi.com/c852024/v852024335/10bfc4/Tj8lq3nMO-U.jpg') no-repeat right top`,
        backgroundSize: '300px 1100px',
        overflowX: 'hidden'

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
        },
        minWidth: 75,
        background: `url('https://pp.userapi.com/c852024/v852024335/10bfc4/Tj8lq3nMO-U.jpg') no-repeat right top`,
        backgroundSize: '300px 1100px'

    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
        background: `url('https://bitstream.pl/wp-content/uploads/2019/04/Logo-Bitstream-4-01.png') no-repeat`,
        backgroundPosition: 'center center',
        backgroundSize: '160px 30px'
    },
    content: {
        flexGrow: 1,
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
        this.setState({open: true});
    };

    handleDrawerClose = () => {
        this.setState({open: false});
    };

    componentWillMount() {
        if (tokenService.verifyToken()) {
            const {user, firm} = tokenService.verifyToken();
            this.props.setUser({user, firm});
        }
    }

    render() {
        const {classes, theme} = this.props;
        const {user} = this.props;
        return (
            <Router history={history}>
                <MuiThemeProvider theme={theme}>
                <div className={'root'}>
                    <div>
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
                                {/*<div className={'logo'}>*/}
                                {/*<img src="https://bitstream.pl/wp-content/uploads/2019/04/Logo-Bitstream-4-01.png" alt=""/>*/}
                                {/*</div>*/}
                                <IconButton onClick={this.handleDrawerClose}>
                                    {theme.direction === 'rtl' ? <ChevronRightIcon color='primary'/> : <ChevronLeftIcon color='primary'/>}
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
                                    <MenuIcon/>
                                </IconButton>
                            </Toolbar>}
                            <Divider light/>
                            <List>
                                <Link to={'/'}><ListItem button>
                                        <HomeIcon/>
                                    <Typography variant="h6" color="inherit">
                                         Home
                                    </Typography>
                                </ListItem></Link>
                                {checkAccess('/dashboard') && <Link to={'/dashboard'}><ListItem button>
                                        <DashboardIcon/>
                                    <Typography variant="h6" color="inherit">
                                         Dashboard
                                    </Typography>
                                </ListItem></Link>}
                                {checkAccess('/admin_panel') && <Link to={'/admin_panel'}><ListItem button>
                                        <DashboardIcon/>
                                    <Typography variant="h6" color="inherit">
                                         Admin Panel
                                    </Typography>
                                </ListItem></Link>}
                                {checkAccess('/devices') && <Link to={'/devices'}><ListItem button>
                                    <Typography variant="h6" color="inherit">
                                        Devices
                                    </Typography>
                                </ListItem></Link>}
                                {user ?
                                    <Link to={'/login'}><ListItem button onClick={this.props.logoutRequest}>
                                        <AccountIcon/><Typography variant="h6" color="inherit">
                                         Logout </Typography>
                                </ListItem></Link> :
                                    <Link to={'/login'}><ListItem button>
                                        <AccountIcon/><Typography variant="h6" color="inherit"> Login</Typography>
                                    </ListItem></Link>}
                            </List>
                        </Drawer>
                    </div>
                    <main className={classes.content}>
                            <Switch history={history}>
                                <Route exact path='/' component={HomeComponent}/>
                                <PrivateRoute exact path='/admin_panel' component={AdminPanelComponent}/>
                                <PrivateRoute exact path='/dashboard' component={DashboardComponent}/>
                                <Route exact path='/login' component={LoginForm}/>
                            </Switch>
                    </main>
                </div>
                    <SnackbarProvider maxSnack={5}>
                        <PopupComponent/>
                    </SnackbarProvider>
                </MuiThemeProvider>
            </Router>)
    }
}

AppComponent.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default withStyles(styles, {withTheme: true})(App);
