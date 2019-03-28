import React, {Component} from "react";
import LoginForm from '../Login/LoginForm';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import {PrivateRoute} from "../privateRoute";

import './App.scss';

import {history} from '../../redux/services/history';
import {tokenService} from "../../redux/services/token";
import {setUser, logoutRequest} from "../../redux/actions/index";
import {connect} from "react-redux";

import DashboardComponent from '../../components/Dashboard/DashboardComponent';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';
import {PopupComponent} from "../material/PopupComponent/PopupComponent";
import {SnackbarProvider} from "notistack";
import FirmAdminComponent from "../FirmAdministration/FirmAdminComponent";
import UserAdminComponent from "../UserAdministration/UserAdminComponent";
import FirmDevicesComponent from "../FirmDevicesComponent/FirmDevicesComponent";
import DeviceAdminComponent from "../DeviceAdministration/DeviceAdminComponent";

import {checkAccess} from "../privateRoute";

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

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (tokenService.verifyToken()) {
      const user = JSON.parse(localStorage.getItem('user')).user;
      this.props.setUser(user);
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
                      <Button color="inherit"><Link to={'/'}>Home</Link></Button>
                    </Typography>
                      {checkAccess('/dashboard') && <Typography variant="h6" color="inherit">
                          <Button color="inherit"> <Link to={'/dashboard'}> Dashboard </Link></Button>
                      </Typography>}
                      {checkAccess('/firms') && <Typography variant="h6" color="inherit">
                          <Button color="inherit"> <Link to={'/firms'}> firms </Link></Button>
                      </Typography>}
                      {checkAccess('/firmDevices') && <Typography variant="h6" color="inherit">
                          <Button color="inherit"> <Link to={'/firmDevices'}> firmDevices </Link></Button>
                      </Typography>}
                      {checkAccess('/users') && <Typography variant="h6" color="inherit">
                          <Button color="inherit"> <Link to={'/users'}> users </Link></Button>
                      </Typography>}
                      {checkAccess('/devices') && <Typography variant="h6" color="inherit">
                          <Button color="inherit"> <Link to={'/devices'}> devices </Link></Button>
                      </Typography>}
                      {user ? <Button color="inherit" onClick={this.props.logoutRequest}><Link
                          to={'/login'}>Logout</Link></Button> :
                          <Button color="inherit"><Link to={'/login'}>Login</Link></Button>}
                  </Toolbar>
                </AppBar>
                <Switch history={history}>
                  <PrivateRoute exact path='/dashboard' component={DashboardComponent}/>
                  <PrivateRoute exact path='/firms' component={FirmAdminComponent}/>
                  <PrivateRoute exact path='/firmDevices' component={FirmDevicesComponent}/>
                  <PrivateRoute exact path='/users' component={UserAdminComponent}/>
                  <PrivateRoute exact path='/devices' component={DeviceAdminComponent}/>
                  <Route exact path='/login' component={LoginForm}/>
                </Switch>
                <SnackbarProvider maxSnack={5}>
                  <PopupComponent />
                </SnackbarProvider>
              </div>
            </MuiThemeProvider>
          </Router>)
    }
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
