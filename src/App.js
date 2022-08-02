import MuiAppBar from "@material-ui/core/AppBar";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Fade from "@material-ui/core/Fade";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Popover from "@material-ui/core/Popover";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import PeopleIcon from "@material-ui/icons/People";
import PublicIcon from "@material-ui/icons/Public";
import SettingsIcon from "@material-ui/icons/Settings";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import { HashRouter as Router, Link, Route, Switch } from "react-router-dom";
import Config from "./pages/config";
import LiveData from "./pages/live-data";
import Clients from "./pages/clients";
import Quakes from "./pages/quakes";
import Users from "./pages/users";
import callAPI from "./utils/call-api";
import DevicesIcon from "@material-ui/icons/Devices";
// import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
// import CssBaseline from '@material-ui/core/CssBaseline';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    // display: 'flex',
    // height: window
  },
  contentRoot: {
    display: "flex",
    height: "100%",
    // flexGrow: 3,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 3,
    height: "calc(100vh - 64px)",
    padding: theme.spacing(3),
  },
  popover: {
    // background: theme.custom.palette.profilePopColor,
    width: theme.spacing(40),
    // borderRadius: theme.shape.borderRadius
  },
  container: {
    display: "flex",
    padding: theme.spacing(2),
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    margin: theme.spacing(1),
    // background: theme.palette.background.default
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingLeft: theme.spacing(1),
  },
  userName: {
    // ...theme.custom.fontFamily.metropolis,
    fontSize: "1rem",
    fontWeight: 500,
  },
  userEmail: {
    // ...theme.custom.fontFamily.roboto,
    fontSize: "0.9rem",
  },
  bar: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonSignout: {
    // ...theme.custom.fontFamily.metropolis,
    borderRadius: theme.spacing(0.5),
    padding: theme.spacing(0.5, 2),
    fontSize: "0.8rem",
    fontWeight: 500,
    textTransform: "none",
  },
}));

function Admin(props) {
  const classes = useStyles();
  const [activeTab, setActiveTab] = React.useState(-1);
  console.log("rerender");
  window.setActiveTab = setActiveTab;
  window.activeTab = activeTab;

  const user = props.user || {
    permissions: { users: 3, quakes: 3, config: 3, live: 3 },
  };

  React.useEffect(() => {
    return;
  }, [props.user]);

  return (
    <Router>
      <div className={classes.contentRoot}>
        {/* <CssBaseline /> */}
        {/* <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
              Clipped drawer
          </Typography>
          </Toolbar>
        </AppBar> */}
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <List>
              <ListItem
                component={Link}
                to="/clients"
                selected={activeTab === 0}
                button
                disabled={user.permissions.users !== 0}
                // disabled={Object.values(user.permissions).every(a => a === 3)}
                key="Clients"
              >
                <ListItemIcon>
                  <DevicesIcon />
                </ListItemIcon>
                <ListItemText primary="Clients" />
              </ListItem>
              <ListItem
                component={Link}
                to="/quakes"
                selected={activeTab === 1}
                button
                disabled={user.permissions.quakes > 1}
                key="Past Quakes"
              >
                <ListItemIcon>
                  <PublicIcon />
                </ListItemIcon>
                <ListItemText primary="Past Quakes" />
              </ListItem>
              <ListItem
                component={Link}
                to="/users"
                selected={activeTab === 2}
                button
                disabled={user.permissions.users > 1}
                key="Users"
              >
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Users" />
              </ListItem>
              <ListItem
                component={Link}
                to="/live-data"
                selected={activeTab === 3}
                button
                disabled={user.permissions.live > 1}
                key="Live Data"
              >
                <ListItemIcon>
                  <ShowChartIcon />
                </ListItemIcon>
                <ListItemText primary="Live Data" />
              </ListItem>
              <ListItem
                component={Link}
                to="/config"
                selected={activeTab === 4}
                button
                disabled={user.permissions.config > 1}
                key="Config"
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Config" />
              </ListItem>
            </List>
          </div>
        </Drawer>
        <main className={classes.content}>
          <Toolbar />
          <Switch>
            <Route path="/live-data">
              {user.permissions.live < 2 && (
                <LiveData setActiveTab={setActiveTab} />
              )}
            </Route>
            <Route path="/quakes">
              {user.permissions.quakes < 2 && (
                <Quakes setActiveTab={setActiveTab} />
              )}
            </Route>
            <Route path="/config">
              {user.permissions.config < 2 && (
                <Config setActiveTab={setActiveTab} />
              )}
            </Route>
            <Route path="/users">
              {user.permissions.users < 2 && (
                <Users setActiveTab={setActiveTab} />
              )}
            </Route>
            <Route path="/clients">
              {user.permissions.users === 0 && (
                <Clients setActiveTab={setActiveTab} />
              )}
            </Route>
          </Switch>
        </main>
      </div>
    </Router>
  );
}

function AppBar(props) {
  const classes = useStyles();
  const user = props.user;

  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function doLogout() {
    delete localStorage.quakeUser;
    window.location.reload();
  }

  async function onGoogleSignIn(gResponse) {
    const response = await fetch(
      `/api/v1/google-callback?token=${gResponse.credential}`,
      { method: "POST" }
    );
    if (response.status === 200) {
      const newUser = await response.json();
      window.setUser(newUser);
      window.makeAlert("Login succeeded", "success");
    } else {
      window.makeAlert("Login error (1)", "error");
    }
  }

  window.onGoogleSignIn = onGoogleSignIn;

  return (
    <MuiAppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <Typography variant="h6" className={classes.title}>
          Quake Admin
        </Typography>
        {user ? (
          <Avatar
            alt={user.name}
            src={user.picture}
            onClick={handleClick}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div>
            <div
              id="g_id_onload"
              data-client_id="292473907562-ocu3lmgkumnsqlhn2ahv79tos40ngd73.apps.googleusercontent.com"
              data-context="signin"
              data-ux_mode="popup"
              data-callback="onGoogleSignIn"
              data-auto_select="true"
              data-close_on_tap_outside="false"
            ></div>

            <div
              class="g_id_signin"
              data-type="standard"
              data-shape="rectangular"
              data-theme="outline"
              data-text="signin_with"
              data-size="large"
              data-logo_alignment="left"
            ></div>
          </div>
        )}

        {user && (
          <Popover
            open={!!anchorEl}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            classes={{
              paper: classes.popover,
            }}
          >
            <div className={classes.container}>
              <Avatar
                alt={user.name}
                className={classes.avatar}
                src={user.picture}
              ></Avatar>
              <div className={classes.userInfo}>
                <Typography
                  className={classes.userName}
                  variant="h6"
                  component="span"
                  color="textPrimary"
                >
                  {user.name}
                </Typography>
                <Typography
                  className={classes.userEmail}
                  variant="body1"
                  component="span"
                  color="textSecondary"
                >
                  {user.email}
                </Typography>
              </div>
            </div>
            <Divider />
            <div className={classes.bar}>
              <Button
                variant="outlined"
                size="small"
                onClick={doLogout}
                classes={{ root: classes.buttonSignout }}
              >
                Sign out
              </Button>
              {/* <Button variant="outlined" size="small" onClick={refreshPermissions} classes={{ root: classes.buttonPermissions }}>Refresh permissions</Button> */}
            </div>
          </Popover>
        )}
      </Toolbar>
    </MuiAppBar>
  );
}

function App() {
  const classes = useStyles();
  const [user, setUser] = React.useState(() => {
    if (localStorage.quakeUser) {
      try {
        var user = JSON.parse(localStorage.quakeUser);
      } catch (exception) {
        delete localStorage.quakeUser;
        return undefined;
      }

      if (user.expiry < Date.now()) {
        delete localStorage.quakeUser;
        return undefined;
      } else {
        return user;
      }
    } else {
      return undefined;
    }
  });

  const [error, setError] = React.useState("");
  const [severity, setSeverity] = React.useState("");
  const [open, setOpen] = React.useState(false);

  window.user = user;
  window.setUser = setUser;

  React.useEffect(() => {
    localStorage.quakeUser = JSON.stringify(user);
  }, [user]);

  React.useEffect(() => {
    async function refreshPermissions() {
      var permissionsResponse = await callAPI("users/me", "GET");
      if (permissionsResponse.success) {
        setUser((prev) => ({
          ...prev,
          permissions: permissionsResponse.json.permissions,
        }));
      }
    }

    if (user) {
      refreshPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function makeAlert(error, severity) {
    setError(error);
    setSeverity(severity);
    setOpen(true);
  }

  window.makeAlert = makeAlert;

  // const theme = createMuiTheme({
  //   typography: {
  //     fontFamily: 'museo-sans, sans-serif',
  //   },
  // });

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
    <Fade in>
      <div className={classes.root}>
        <AppBar user={user} />
        <Admin user={user} />
        <Snackbar
          open={open}
          autoHideDuration={5000}
          onClose={() => {
            setOpen(false);
          }}
        >
          <Alert
            severity={severity}
            onClose={() => {
              setOpen(false);
            }}
          >
            {error}
          </Alert>
        </Snackbar>
      </div>
    </Fade>
    // </ThemeProvider>
  );
}

export default App;
