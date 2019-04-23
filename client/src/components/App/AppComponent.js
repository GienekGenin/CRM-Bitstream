import React, {Component} from "react";
import {Router, Switch, Route, Link} from 'react-router-dom';
import {PrivateRoute} from "../privateRoute";

// Material
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';

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

    componentWillMount() {
        if (tokenService.verifyToken()) {
            const {user, firm} = tokenService.verifyToken();
            this.props.setUser({user, firm});
        }
    }

    render() {
        const {user} = this.props;
        return (
            <Router history={history}>
                <MuiThemeProvider theme={theme}>
                    <div>
                        <AppBar position="static" color="primary">
                            <Toolbar>
                                <div className="logo">
                                    <img
                                        src="http://bitstream.pl/wp-content/uploads/2018/03/Logo-Bitstream-4-01.png"
                                        alt=""/>
                                </div>
                                <Typography variant="h6" color="inherit">
                                    <Link to={'/'}><Button color="inherit">Home</Button></Link>
                                </Typography>
                                {checkAccess('/dashboard') && <Typography variant="h6" color="inherit">
                                    <Link to={'/dashboard'}><Button color="inherit"> Dashboard </Button></Link>
                                </Typography>} {checkAccess('/admin_panel') && <Typography variant="h6" color="inherit">
                                <Link to={'/admin_panel'}><Button color="inherit"> Admin Panel </Button></Link>
                            </Typography>}
                                {checkAccess('/devices') && <Typography variant="h6" color="inherit">
                                    <Link to={'/devices'}><Button color="inherit"> devices </Button></Link>
                                </Typography>}
                                {user ? <Button color="inherit" onClick={this.props.logoutRequest}><Link
                                        to={'/login'}>Logout</Link></Button> :
                                    <Link to={'/login'}><Button color="inherit">Login</Button></Link>}
                            </Toolbar>
                        </AppBar>
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
                    </div>
                </MuiThemeProvider>
            </Router>)
    }
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
