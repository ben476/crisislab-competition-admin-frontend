import AppBar from "@material-ui/core/AppBar";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Snackbar from "@material-ui/core/Snackbar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import Alert from "@material-ui/lab/Alert";
import React from "react";
import GoogleLogin from "react-google-login";
import ShowChartIcon from "@material-ui/icons/ShowChart";
import PieChartIcon from "@material-ui/icons/PieChart";
import PeopleIcon from "@material-ui/icons/People";
import SettingsIcon from "@material-ui/icons/Settings";
import PublicIcon from "@material-ui/icons/Public";
import AppleIcon from "@material-ui/icons/Apple";
import AndroidIcon from "@material-ui/icons/Android";
import UAParser from "ua-parser-js";
import { io } from "socket.io-client";

import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
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
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Clients(props) {
  const classes = useStyles();
  console.log("render overview");

  const [clients, setClients] = React.useState([]);
  const [firebaseSubscriptions, setFirebaseSubscriptions] = React.useState([]);
  const [timestamp, setTimestamp] = React.useState(0);
  const [socket, setSocket] = React.useState(() =>
    io(window.location.origin, {
      extraHeaders: {
        Authorization: window.user.token,
      },
    })
  );

  const callAPI = window.callAPI;

  React.useEffect(() => {
    async function getClients() {
      const { success, json } = await callAPI("clients", "GET");
      if (success) {
        var parser = new UAParser();
        var result = {};
        var newClients = [];
        var i;

        for (i of Object.keys(json.socketio)) {
          parser.setUA(json.socketio[i].userAgent);
          result = parser.getResult();
          newClients.push({ UA: result, user: json.socketio[i].user, sid: i });
        }

        setClients(newClients);

        newClients = [];

        for (i of json.firebase) {
          parser.setUA(i.userAgent);
          result = parser.getResult();
          newClients.push({ UA: result, token: i.token });
        }

        setFirebaseSubscriptions(newClients);

        setTimestamp(json.timestamp);

        socket.emit("listen clients");

        socket.on("new client", (msg) => {
          console.log("new client");
          if (msg.sid) {
            setClients((prev) => [
              ...prev,
              {
                UA: UAParser(msg.userAgent),
                user: msg.user,
                sid: msg.sid,
              },
            ]);
          } else {
            setFirebaseSubscriptions((prev) => [
              ...prev,
              {
                UA: UAParser(msg.userAgent),
                token: msg.token,
              },
            ]);
          }
        });

        socket.on("remove client", (msg) => {
          if (msg.sid) {
            setClients((prev) => prev.filter((a) => a.sid !== msg.sid));
          } else {
            setFirebaseSubscriptions((prev) =>
              prev.filter((a) => a.token !== msg.token)
            );
          }
        });
      }
    }
    getClients();

    return () => {
      socket.emit("disconnect clients");
      socket.off("new client");
      socket.off("remove client");
      socket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    props.setActiveTab(0);
  }, []);

  console.log(clients);
  return (
    <Fade in>
      <div>
        <Typography variant="h4" style={{ marginBlock: 20 }}>
          Socket.io clients:
        </Typography>
        <Grid container spacing={2}>
          {clients.map((client) => (
            <Grid item xs={12} sm={6} lg={4}>
              <Paper style={{ width: "90%", padding: "16px" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    {client.UA.os.name === "Android" ? (
                      <AndroidIcon
                        style={{ width: "100%", fontSize: "100px" }}
                      />
                    ) : client.UA.os.name === "Mac OS" ||
                      client.UA.os.name === "iOS" ? (
                      <AppleIcon style={{ width: "100%", fontSize: "100px" }} />
                    ) : (
                      <DesktopWindowsIcon
                        style={{ width: "100%", fontSize: "100px" }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6} sm={8}>
                    <div>
                      <Typography variant="h6">
                        {client.UA.browser.name} {client.UA.browser.major} on{" "}
                        {client.UA.os.name} {client.UA.os.version}
                      </Typography>
                      <Typography variant="body1">
                        {client.user.name}
                      </Typography>
                      <Button
                        onClick={() => {
                          // window.callAPI(
                          //   "alert/socketio",
                          //   "POST",
                          //   {
                          //     sid: client.sid,
                          //   },
                          //   "Alert sent"
                          // );
                          socket.emit("alert", client.sid, () =>
                            window.makeAlert("Alert sent", "success")
                          );
                        }}
                        color="primary"
                        variant="contained"
                        style={{ marginBlock: 5 }}
                        disabled={window.user.permissions.config !== 0}
                      >
                        Send test alert
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography variant="h4" style={{ marginBlock: 20 }}>
          Firebase clients:
        </Typography>
        <Grid container spacing={2}>
          {firebaseSubscriptions.map((client) => (
            <Grid item xs={12} sm={6} lg={4}>
              <Paper style={{ width: "100%", padding: "16px" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    {client.UA.os.platform === "Android" ? (
                      <AndroidIcon
                        style={{ width: "100%", fontSize: "150px" }}
                      />
                    ) : client.UA.os.platform === "Mac OS" ||
                      client.UA.os.platform === "iOS" ? (
                      <AppleIcon style={{ width: "100%", fontSize: "150px" }} />
                    ) : (
                      <DesktopWindowsIcon
                        style={{ width: "100%", fontSize: "150px" }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={6} sm={8}>
                    <div>
                      <Typography variant="h5">
                        {client.UA.browser.name} {client.UA.browser.major} on{" "}
                        {client.UA.os.name} {client.UA.os.version}
                      </Typography>
                      <Button
                        onClick={() => {
                          window.callAPI(
                            "subscription",
                            "DELETE",
                            {
                              token: client.token,
                            },
                            "Client unsubscribed"
                          );
                        }}
                        color="primary"
                        variant="outlined"
                        style={{ marginBlock: 5 }}
                        disabled={window.user.permissions.config !== 0}
                      >
                        unsubscribe
                      </Button>
                      <Button
                        onClick={() => {
                          window.callAPI(
                            "alert/firebase",
                            "POST",
                            {
                              token: client.token,
                            },
                            "Alert sent"
                          );
                        }}
                        color="primary"
                        variant="contained"
                        style={{ marginBlock: 5 }}
                        disabled={window.user.permissions.config !== 0}
                      >
                        Send test alert
                      </Button>
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </div>
    </Fade>
  );
}
