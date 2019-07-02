import React, {Component} from "react";
import {Router, Switch, Route, Link} from 'react-router-dom';
import {PrivateRoute} from "../privateRoute";
import PropTypes from 'prop-types';
import classNames from 'classnames';

// Material
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import {MuiThemeProvider} from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import HomeIcon from '@material-ui/icons/Home';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AccountIcon from '@material-ui/icons/AccountCircle';
import {withStyles} from "@material-ui/core";
import {SnackbarProvider} from "notistack";
import {PopupComponent} from "../UI/material/PopupComponent/PopupComponent";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ViewListIcon from "@material-ui/icons/ViewList";
import PersonIcon from "@material-ui/icons/Person";


// Redux
import {history} from '../../redux/services/history';
import {tokenService} from "../../redux/services/token";
import {setUser, logoutRequest} from "../../redux/actions/index";
import {connect} from "react-redux";
import {checkAccess} from "../privateRoute";

// Components
import './App.scss';
import LoginForm from '../Login/LoginComponent';
import HomeComponent from "../Home/HomeComponent";
import AdminPanelComponent from "../AdminPanel/AdminPanelComponent";
import DashboardComponent from '../../components/Dashboard/DashboardComponent';
// import Fade from 'react-reveal/Fade';

const styles = theme => ({
    root: {
        display: 'flex 0 0',
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
        marginLeft: 230,
        width: `calc(100% - ${200}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
				marginLeft: 15,
				"&:hover": {
					backgroundColor: "transparent"
				}
    },
		menuButtonOpen: {
			"&:hover": {
				backgroundColor: "transparent"
			}
		},
    hide: {
        display: 'none',
    },
    drawer: {
        width: 230,
        minWidth: 75,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        background: `url('https://pp.userapi.com/c852024/v852024335/10bfc4/Tj8lq3nMO-U.jpg') no-repeat right top`,
        backgroundSize: '300px 1100px',
    },
    drawerOpen: {
        width: 230,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
        }),
        background: `url('https://pp.userapi.com/c852024/v852024335/10bfc4/Tj8lq3nMO-U.jpg') no-repeat right top`,
        backgroundSize: '300px 1100px',
        overflowX: 'hidden'
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: 500,
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
        marginLeft: '15px',
    },
    content: {
        flexGrow: 1,
		},
		
});

const mapDispatchToProps = (dispatch) => {
    return {
        logoutRequest: () => dispatch(logoutRequest()),
        setUser: (user) => dispatch(setUser(user))
    };
};

const mapStateToProps = state => {
    return {userInfo: state.loginReducer.user};
};

class AppComponent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            animations: false,
        }
    };

    handleDrawerToggle = () => {
        let {open} = this.state;
        this.setState({open: !open, animations: true});
    };

    componentWillMount = () => {
        if (tokenService.verifyToken()) {
            const {user, firm} = tokenService.verifyToken();
            this.props.setUser({user, firm});
        }
    };


    render() {
        const {open, animations} = this.state;
        const {classes, theme, userInfo} = this.props;

        return (
            <Router history={history}>
                <MuiThemeProvider theme={theme}>
                    <div className={'root'}>
                        <div>
                            <Drawer
                                variant="permanent"
                                className={classNames(classes.drawer, {
                                    [classes.drawerOpen]: open,
                                    [classes.drawerClose]: !open,
                                })}
                                classes={{
                                    paper: classNames({
                                        [classes.drawerOpen]: open,
                                        [classes.drawerClose]: !open,
                                    }),
                                }}
                                open={open}
                            >

                                {open && <div className={classes.toolbar}>
                                    <IconButton
																				onClick={this.handleDrawerToggle}
																				className={classNames(classes.menuButtonOpen)}
                                    >
                                        <MoreVertIcon/>
                                    </IconButton>
                                    <div
                                        className={classNames('company-logo', (animations ? (open ? 'fade-left' : 'fade-right') : ''))}>
                                        <img
                                            src="https://bitstream.pl/wp-content/uploads/2019/04/Logo-Bitstream-4-01.png"
                                            alt=""/>
                                    </div>
                                </div>}
                                {!open && <Toolbar disableGutters={!open}>
                                    <IconButton
																				color="inherit"
                                        aria-label="Open drawer"
                                        onClick={this.handleDrawerToggle}
                                        className={classNames(classes.menuButton, {
                                            [classes.hide]: open,
                                        })}
                                    >
                                        <ViewListIcon/>
                                    </IconButton>
                                    <div
                                        className={classNames('company-logo', (animations ? (open ? 'fade-left' : 'fade-right') : ''))}
																				hover="false">
                                        <img className="fixed-height"
                                             src="https://bitstream.pl/wp-content/uploads/2019/04/Logo-Bitstream-4-01.png"
                                             alt=""/>
                                    </div>
                                </Toolbar>}
                                <Divider light/>
                                <List>
                                    <Link to={""}>
                                        {userInfo && <ListItem button className={'hoverClass'}>
                                            <PersonIcon/>
                                            <Typography
                                                variant="h6" color="inherit"
                                                className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                {userInfo.user.name}
                                            </Typography>

                                        </ListItem>}
                                    </Link>
                                    <Link to={'/'}>
                                        <ListItem
                                            button
                                            className={'hoverClass'}
                                        >
                                            <HomeIcon/>
                                            <Typography
                                                variant="h6" color="inherit"
                                                className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Home
                                            </Typography>
                                        </ListItem>
                                    </Link>
                                    {checkAccess('/dashboard') && <Link to={'/dashboard'}>
                                        <ListItem
                                            button
                                            className={'hoverClass'}
                                        >
                                            <DashboardIcon/>
                                            <Typography variant="h6" color="inherit"
                                                        className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Dashboard
                                            </Typography>
                                        </ListItem>
                                    </Link>}
                                    {checkAccess('/admin_panel') && <Link to={'/admin_panel'}>
                                        <ListItem
                                            button
                                            className={'hoverClass'}
                                        >
                                            <DashboardIcon/>
                                            <Typography variant="h6" color="inherit"
                                                        className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Admin Panel
                                            </Typography>
                                        </ListItem>
                                    </Link>}
                                    {checkAccess('/devices') && <Link to={'/devices'}>
                                        <ListItem
                                            button
                                            className={'hoverClass'}
                                        >
                                            <Typography variant="h6" color="inherit"
                                                        className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Devices
                                            </Typography>
                                        </ListItem>
                                    </Link>}
                                    {userInfo ? <Link to={'/login'}>
                                            <ListItem
                                                button
                                                className={'hoverClass'}
                                                onClick={this.props.logoutRequest}>
                                                <AccountIcon/><Typography variant="h6" color="inherit"
                                                                          className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Logout </Typography>
                                            </ListItem>
                                        </Link> :
                                        <Link to={'/login'}>
                                            <ListItem
                                                button
                                                className={'hoverClass'}
                                            >
                                                <AccountIcon/><Typography variant="h6" color="inherit"
                                                                          className={classNames(animations ? (open ? 'fade-left' : 'fade-right') : '')}
                                            >
                                                Login</Typography>
                                            </ListItem>
                                        </Link>}
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
