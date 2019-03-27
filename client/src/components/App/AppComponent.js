import React, {Component} from "react";
import LoginForm from '../Login/LoginForm';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import './App.scss';
import {history} from '../../redux/services/history';
import {PrivateRoute} from "../privateRoute";
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
import {SnackbarProvider} from "notistack";
import {PopupComponent} from "../material/PopupComponent/PopupComponent";

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
    if (this.props.user) {
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
                    <Typography variant="h6" color="inherit">
                      <Button color="inherit"> <Link to={'/dash'}> Dashboard </Link></Button>
                    </Typography>
                    <Button color="inherit" onClick={this.props.logoutRequest}><Link
                        to={'/login'}>Logout</Link></Button>
                  </Toolbar>
                </AppBar>
                <Switch history={history}>
                  <PrivateRoute exact path='/dash' component={DashboardComponent}/>
                  <Route exact path='/login' component={LoginForm}/>
                </Switch>
                <SnackbarProvider maxSnack={5}>
                  <PopupComponent />
                </SnackbarProvider>
              </div>
            </MuiThemeProvider>
          </Router>)
    }
    return (
        <Router history={history}>
          <MuiThemeProvider theme={theme}>
            <div>
              <AppBar position="static" color="primary">
                <Toolbar>
                  <div className="logo">
                    <img src="http://bitstream.pl/wp-content/uploads/2018/03/Logo-Bitstream-4-01.png"
                         alt=""/>
                  </div>
                  <Typography variant="h6" color="inherit">
                  <Button color="inherit"><Link to={'/'}>Home</Link></Button>
                </Typography>
                  <Button color="inherit"><Link to={'/login'}>Login</Link></Button>
                </Toolbar>
              </AppBar>
              <Switch history={history}>
                <PrivateRoute exact path='/dash' component={DashboardComponent}/>
                <Route exact path='/login' component={LoginForm}/>
              </Switch>
              <SnackbarProvider maxSnack={5}>
                <PopupComponent />
              </SnackbarProvider>
            </div>
          </MuiThemeProvider>
        </Router>
    );
  }
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
