import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import SaveIcon from "@material-ui/icons/Save";
import SendIcon from "@material-ui/icons/Send";
import React from "react";

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

export default function Config(props) {
  const classes = useStyles();
  console.log("render overview");
  const [config, setConfig] = React.useState({});
  const [timestamp, setTimestamp] = React.useState(0);
  const [modifiedKeys, setModifiedKeys] = React.useState([]);

  const callAPI = window.callAPI;

  React.useEffect(() => {
    async function getUser() {
      const { success, json } = await callAPI("config", "GET");
      if (success) {
        setConfig(json.config);
        setTimestamp(json.timestamp);
      }
    }
    getUser();
  }, []);

  React.useEffect(() => {
    props.setActiveTab(4);
  }, []);

  function updateConfig(key, value) {
    setConfig({ ...config, [key]: value });
    if (!key in modifiedKeys) setModifiedKeys([...modifiedKeys, key]);
  }

  async function setServerConfig() {
    var newConfig = {};
    for (var key of modifiedKeys) {
      newConfig[key] = config[key];
    }

    if (Object.keys(newConfig).length === 0) return;
    const { success, json } = await callAPI("config", "POST", {
      config: JSON.stringify(newConfig),
    });
    if (success) {
      setConfig(json.config);
      setTimestamp(json.timestamp);
      setModifiedKeys([]);
    }
  }

  console.log("config", config);

  return (
    <Fade in>
      <div>
        <Typography variant="body1">
          Last updated: {new Date(timestamp).toTimeString()}
        </Typography>
        <Button
          onClick={() => {
            window.callAPI(
              "config",
              "POST",
              {
                config: JSON.stringify(config),
              },
              "Config saved"
            );
          }}
          color="primary"
          variant="contained"
          style={{ marginBlock: 5 }}
          startIcon={<SaveIcon />}
          disabled={window.user.permissions.config !== 0}
        >
          save config
        </Button>
        <Typography variant="body1" style={{ marginBlock: 5 }}>
          Note: Updates may take up to 10 seconds to come into effect.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Paper style={{ padding: 20, height: "100%" }}>
              <Typography variant="h5">Quakes and Datacast:</Typography>
              <div style={{ marginBlock: 20, height: "auto" }}>
                <Typography variant="h6" style={{ marginBottom: "-5px" }}>
                  Datacast:
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.recieveMode === "client"}
                      onChange={(event) =>
                        updateConfig(
                          "recieveMode",
                          event.target.checked ? "client" : "server"
                        )
                      }
                      name="checkedB"
                      color="primary"
                    />
                  }
                  //   labelPlacement="start"
                  label="Use proxy server"
                  style={{ width: "100%", marginTop: 5 }}
                />
                <FormControl component="fieldset">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.proxyServerIP}
                          //   style={{ marginLeft: 5 }}
                          inputProps={{ style: { textAlign: "right" } }}
                          style={{ width: "auto" }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              proxyServerIP: event.target.value,
                            }))
                          }
                        />
                      }
                      labelPlacement="start"
                      label="Proxy server IP:"
                    />
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.proxyServerPort}
                          inputProps={{ style: { textAlign: "right" } }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              proxyServerPort: parseInt(event.target.value),
                            }))
                          }
                          //   style={{ marginLeft: 5 }}
                        />
                      }
                      labelPlacement="start"
                      label="Proxy server port:"
                    />
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.serverPort}
                          inputProps={{ style: { textAlign: "right" } }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              serverPort: parseInt(event.target.value),
                            }))
                          }
                          //   style={{ marginLeft: 5 }}
                        />
                      }
                      labelPlacement="start"
                      label="Server port:"
                    />
                  </FormGroup>
                </FormControl>
              </div>
              <div style={{ marginBlock: 20, height: "auto" }}>
                <Typography variant="h6" style={{ marginBottom: "5px" }}>
                  Quakes:
                </Typography>

                <FormControl component="fieldset">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.threshold}
                          //   style={{ marginLeft: 5 }}
                          inputProps={{ style: { textAlign: "right" } }}
                          style={{ width: "auto" }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              threshold: parseInt(event.target.value),
                            }))
                          }
                        />
                      }
                      labelPlacement="start"
                      label="Threshold:"
                    />
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.detrendTime}
                          inputProps={{ style: { textAlign: "right" } }}
                          //   style={{ marginLeft: 5 }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              detrendTime: parseInt(event.target.value),
                            }))
                          }
                        />
                      }
                      labelPlacement="start"
                      label="Detrend time:"
                    />
                  </FormGroup>
                </FormControl>
              </div>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper style={{ padding: 20, height: "100%" }}>
              <Typography variant="h5">Alerts:</Typography>
              <div style={{ marginBlock: 20, height: "auto" }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Notification details</FormLabel>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.notificationTitle}
                          //   style={{ marginLeft: 5 }}
                          inputProps={{ style: { textAlign: "right" } }}
                          style={{ marginLeft: 10, width: 300 }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              notificationTitle: event.target.value,
                            }))
                          }
                        />
                      }
                      labelPlacement="start"
                      label="Notification title:"
                    />
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.notificationBody}
                          inputProps={{ style: { textAlign: "right" } }}
                          style={{ marginLeft: 10, width: 300 }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              notificationBody: event.target.value,
                            }))
                          }
                          //   style={{ marginLeft: 5 }}
                        />
                      }
                      labelPlacement="start"
                      label="Notification body:"
                    />
                    <FormControlLabel
                      control={
                        <TextField
                          required
                          value={config.notificationImage}
                          inputProps={{ style: { textAlign: "right" } }}
                          style={{ marginLeft: 10, width: 300 }}
                          onChange={(event) =>
                            setConfig((prev) => ({
                              ...prev,
                              notificationImage: event.target.value,
                            }))
                          }
                        />
                      }
                      labelPlacement="start"
                      label="Notification image:"
                    />
                  </FormGroup>
                </FormControl>
                <Button
                  onClick={() => {
                    window.callAPI("alert", "GET", {}, "Alert sent");
                  }}
                  color="primary"
                  variant="outlined"
                  style={{ marginTop: 20 }}
                  disabled={window.user.permissions.live !== 0}
                  startIcon={<SendIcon />}
                >
                  Test Alert Notification
                </Button>
              </div>
            </Paper>
          </Grid>
        </Grid>
      </div>
    </Fade>
  );
}
