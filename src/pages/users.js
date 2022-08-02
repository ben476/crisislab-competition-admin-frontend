import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { DataGrid } from "@material-ui/data-grid";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import callAPI from "../utils/call-api";

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
    // flexGrow: 1,
    margin: -24,
    height: "100%",
  },
  selected: {
    backgroundColor: "#FFFFFF",
    // color: "#FFFFFF"
  },
}));

function CreateUser(props) {
  const [email, setEmail] = React.useState("");
  const [permissions, setPermissions] = React.useState({
    users: 2,
    quakes: 1,
    config: 1,
    live: 1,
  });

  async function createUser() {
    const { success, json } = await callAPI(
      "users",
      "POST",
      { email, permissions: JSON.stringify(permissions) },
      "User created"
    );
    if (success) {
      props.setUsers((prev) => [...prev, json]);
      props.setSelectedUser(json);
    }
  }
  return (
    <Paper
      square
      style={{
        height: "calc(100% - 24px)",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
      }}
    >
      <div style={{ height: "120px" }}>
        <Typography variant="h5">Permissions:</Typography>

        <Grid container spacing={2} style={{ marginTop: "0px" }}>
          {[
            ["users", "Users: "],
            ["quakes", "Past quakes: "],
            ["live", "Live data: "],
            ["config", "Config: "],
          ].map(([key, name]) => (
            <Grid item xs={3}>
              <Typography variant="body1">{name}</Typography>
              {permissions && (
                <Select
                  value={permissions[key]}
                  onChange={(info, value) => {
                    setPermissions((prev) => ({
                      ...prev,
                      [key]: value.props.value,
                    }));
                  }}
                >
                  {key !== "quakes" && <MenuItem value={2}>None</MenuItem>}
                  <MenuItem value={1}>Read</MenuItem>
                  <MenuItem value={0}>Write</MenuItem>
                </Select>
              )}
            </Grid>
          ))}
        </Grid>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Typography variant="h5" style={{ marginBottom: "10px" }}>
          Email:
        </Typography>
        <TextField
          onChange={(event) => {
            setEmail(event.target.value);
          }}
          label="New user email"
          variant="outlined"
        />
      </div>
      <Button
        onClick={() => {
          createUser();
        }}
        color="primary"
        variant="contained"
        startIcon={<AddIcon />}
      >
        Create
      </Button>
    </Paper>
  );
}

function User(props) {
  const [user, setUser] = React.useState(props.user);
  const [permissionsChange, setPermissionsChange] = React.useState(false);
  const [permissions, setPermissions] = React.useState();

  React.useEffect(() => {
    setUser(props.user);
    setPermissionsChange(false);
    setPermissions(undefined);

    async function getUser() {
      const { success, json } = await callAPI(
        "users/" + props.user.email,
        "GET"
      );
      if (success) {
        setUser(json);
        setPermissions(json.permissions);
      }
    }

    getUser();
  }, [props.user]);

  // Update permissions when changed
  React.useEffect(() => {
    if (permissionsChange) {
      async function updatePermissions() {
        const { success, json } = await callAPI(
          "users/" + user.email + "/permissions",
          "PUT",
          { permissions: JSON.stringify(permissions) },
          "Permissions updated"
        );
        if (success) {
          setUser(json);
          setPermissions(json.permissions);
          setPermissionsChange(false);
        }
      }
      updatePermissions();
    }
  }, [permissionsChange]);

  const rows =
    (user.logs &&
      user.logs
        .map((a, i) => ({ ...a, id: i }))
        .sort((b, c) => c.timestamp - b.timestamp)) ||
    [];
  console.log(rows);
  const columns = [
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 8,
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    { field: "endpoint", headerName: "Endpoint", flex: 8 },
    { field: "method", headerName: "Method", flex: 6 },
    {
      field: "parameters",
      headerName: "Parameters",
      flex: 7,
      renderCell: (params) => JSON.stringify(params.value),
    },
  ];

  return (
    <Paper
      square
      style={{
        height: "calc(100% - 24px)",
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "24px",
      }}
    >
      <div style={{ height: "120px", marginTop: "0px" }}>
        <Grid container spacing={2} style={{ marginTop: "0px" }}>
          <Grid item xs={8} style={{ marginTop: "0px" }}>
            <Typography variant="h5">Permissions:</Typography>
            <Grid container spacing={2} style={{ marginTop: "0px" }}>
              {[
                ["users", "Users: "],
                ["quakes", "Past quakes: "],
                ["live", "Live data: "],
                ["config", "Config: "],
              ].map(([key, name]) => (
                <Grid item xs={3}>
                  <Typography variant="body1">{name}</Typography>
                  {permissions && (
                    <Select
                      value={permissions[key]}
                      onChange={(info, value) => {
                        if (permissions[key] !== value.props.value) {
                          setPermissions((prev) => ({
                            ...prev,
                            [key]: value.props.value,
                          }));
                          setPermissionsChange(true);
                        }
                      }}
                    >
                      {key !== "quakes" && <MenuItem value={2}>None</MenuItem>}
                      <MenuItem value={1}>Read</MenuItem>
                      <MenuItem value={0}>Write</MenuItem>
                    </Select>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item xs={4} style={{ marginTop: "0px" }}>
            <Typography variant="h5">Actions:</Typography>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "10px", marginTop: "5px" }}
              startIcon={<DeleteIcon />}
              onClick={async () => {
                const { success } = await callAPI(
                  "users/" + user.email,
                  "DELETE",
                  {},
                  "User deleted"
                );
                if (success) {
                  props.setSelectedUser("new");
                  props.setUsers((prev) =>
                    prev.filter((a) => a.email !== user.email)
                  );
                }
              }}
              disabled={window.user.permissions.users !== 0}
            >
              Delete
            </Button>
          </Grid>
        </Grid>
      </div>
      <div style={{ height: "calc(100% - 200px)" }}>
        <Typography variant="h5" style={{ marginBottom: "15px" }}>
          Logs:
        </Typography>
        <DataGrid rows={rows} columns={columns} loading={!user.logs} />
      </div>
    </Paper>
  );
}

export default function Users(props) {
  console.log("render users");

  const classes = useStyles();
  const [users, setUsers] = React.useState();
  const [selectedUser, setSelectedUser] = React.useState("new");

  React.useEffect(() => {
    props.setActiveTab(2);
  }, [props]);

  React.useEffect(() => {
    async function getUser() {
      const { success, json } = await callAPI("users", "GET");
      if (success) {
        setUsers(json.list);
      }
    }
    getUser();
  }, []);

  return (
    <div className={classes.content}>
      <Fade in style={{ height: "100%" }}>
        <div style={{ height: "100%" }}>
          <Grid container spacing={0} style={{ height: "100%" }}>
            <Grid item xs={4}>
              <List
                component="nav"
                disablePadding
                style={{
                  height: "100%",
                  backgroundColor: "rgba(0, 0, 0, 0.08)",
                }}
              >
                {users &&
                  users.map((user) => (
                    <ListItem
                      button
                      style={{
                        backgroundColor:
                          selectedUser &&
                          user.email === selectedUser.email &&
                          "#FFFFFF",
                        boxShadow:
                          selectedUser &&
                          user.email === selectedUser.email &&
                          "-4px 0px 5px -2px #888",
                      }}
                      selected={
                        selectedUser && user.email === selectedUser.email
                      }
                      onClick={() => setSelectedUser(user)}
                    >
                      <ListItemIcon>
                        <Avatar src={user.picture} />
                      </ListItemIcon>
                      <ListItemText
                        primary={user.name || user.email}
                        secondary={
                          user.name
                            ? user.email
                            : "Awaiting first sign in to get details"
                        }
                      />
                    </ListItem>
                  ))}
                <ListItem
                  button
                  style={{
                    backgroundColor: "new" === selectedUser && "#FFFFFF",
                    boxShadow:
                      selectedUser &&
                      "new" === selectedUser &&
                      "-4px 0px 5px -2px #888",
                  }}
                  selected={selectedUser === "new"}
                  onClick={() => setSelectedUser("new")}
                >
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Create new user" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={8} style={{ height: "100%" }}>
              {selectedUser === "new" ? (
                <CreateUser
                  setUsers={setUsers}
                  setSelectedUser={setSelectedUser}
                />
              ) : (
                users && (
                  <User
                    setUsers={setUsers}
                    user={selectedUser}
                    setSelectedUser={setSelectedUser}
                  />
                )
              )}
            </Grid>
          </Grid>
        </div>
      </Fade>
    </div>
  );
}
