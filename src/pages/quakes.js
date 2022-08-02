import Button from "@material-ui/core/Button";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { DataGrid } from "@material-ui/data-grid";
import DeleteIcon from "@material-ui/icons/Delete";
import EventIcon from "@material-ui/icons/Event";
import HeightIcon from "@material-ui/icons/Height";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import ScheduleIcon from "@material-ui/icons/Schedule";
import React from "react";
import {
  Link,
  Route,
  Switch,
  useHistory,
  useParams,
  useRouteMatch,
} from "react-router-dom";
import { useMeasure } from "react-use";
import {
  HorizontalGridLines,
  LineSeriesCanvas,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import "../App.css";
import callAPI from "../utils/call-api";

function Quake(props) {
  let history = useHistory();
  // const [rawData, setRawData] = React.useState({})
  let { quakeID } = useParams();
  const [quake, setQuake] = React.useState(props.quakes[quakeID]);
  const [sixRef, sixMeasurements] = useMeasure();

  console.log("render quake");

  React.useEffect(() => {
    async function getQuake() {
      const { success, json } = await callAPI("quakes/" + quakeID, "GET");
      if (success) {
        setQuake(json);
      }
    }

    if (!(quake && quake.data)) {
      getQuake();
    }
    return;
  }, [quake, quakeID]);

  return (
    <Fade in>
      <div>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h6">Details:</Typography>
            {quake && (
              <div style={{ paddingLeft: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <EventIcon />
                  <Typography variant="body1" style={{ marginLeft: "10px" }}>
                    {new Date(quake.timeStart).toDateString()}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <ScheduleIcon />
                  <Typography variant="body1" style={{ marginLeft: "10px" }}>
                    {new Date(quake.timeStart).toLocaleTimeString()} -{" "}
                    {new Date(quake.timeEnd).toLocaleTimeString()}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <HourglassEmptyIcon />
                  <Typography variant="body1" style={{ marginLeft: "10px" }}>
                    {Math.round((quake.timeEnd - quake.timeStart) / 100) / 10}{" "}
                    seconds
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <HeightIcon />
                  <Typography variant="body1" style={{ marginLeft: "10px" }}>
                    {Math.round(quake.strength / 100000) / 10} million EHZ
                    counts per second
                  </Typography>
                </div>
              </div>
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">Actions:</Typography>
            {quake && (
              <Button
                variant="contained"
                color="primary"
                style={{ marginLeft: "10px" }}
                startIcon={<DeleteIcon />}
                onClick={async () => {
                  const { success } = await callAPI(
                    "quakes/" + quakeID,
                    "DELETE",
                    {},
                    "Quake deleted"
                  );
                  if (success) {
                    history.push("/quakes");
                  }
                }}
                disabled={window.user.permissions.quakes !== 0}
              >
                Delete
              </Button>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6">Raw data:</Typography>
            <Typography style={{ marginTop: "10px" }} variant="body1">
              All y-axis represent strength in thousand counts per 10
              milliseconds
            </Typography>
          </Grid>

          {["EHZ", "ENE", "ENN", "ENZ"].map((channel) => (
            <Grid item xs={6}>
              <Paper style={{ height: "202px" }}>
                <Typography variant="h6" style={{ marginLeft: "40%" }}>
                  Channel {channel}
                </Typography>
                {quake && quake.data ? (
                  <XYPlot width={sixMeasurements.width - 20} height={170}>
                    <VerticalGridLines />
                    <HorizontalGridLines />
                    <XAxis title="Time (seconds)" />
                    <YAxis />
                    <LineSeriesCanvas
                      strokeWidth={1}
                      data={quake.data[channel].map((y, time) => ({
                        x: time / 100,
                        y: y / 1000,
                      }))}
                    />
                  </XYPlot>
                ) : (
                  <div width={sixMeasurements.width - 20} height={170} />
                )}
              </Paper>
            </Grid>
          ))}
          <Grid item xs={6}>
            <div ref={sixRef} />
          </Grid>
        </Grid>
      </div>
    </Fade>
  );
}

function QuakesList(props) {
  const [page, setPage] = React.useState(0);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [totalRows, setTotalRows] = React.useState(1000);

  const { setQuakes } = props;

  let match = useRouteMatch();
  const path = match.path;

  console.log("render quakes list");

  const columns = [
    { field: "id", headerName: "#", flex: 1 },
    {
      field: "strength",
      headerName: "Intensity (million EHZ counts per second)",
      flex: 3.5,
      renderCell: (params) => Math.round(params.value / 100000) / 10,
    },
    {
      field: "date",
      headerName: "Date",
      flex: 2.5,
      renderCell: (params) => new Date(params.value).toDateString(),
    },
    {
      field: "timeStart",
      headerName: "Start time",
      flex: 2,
      renderCell: (params) => new Date(params.value).toLocaleTimeString(),
    },
    {
      field: "timeEnd",
      headerName: "End time",
      flex: 2,
      renderCell: (params) => new Date(params.value).toLocaleTimeString(),
    },
    {
      field: "view",
      headerName: " ",
      flex: 1,
      renderCell: (params) => (
        <Button component={Link} to={path + "/" + params.value.toString()}>
          View
        </Button>
      ),
    },
  ];

  const handlePageChange = (params) => {
    setPage(params.page);
  };

  React.useEffect(() => {
    async function getQuakes(page, per_page) {
      const { success, json } = await callAPI("quakes", "GET", {
        page,
        per_page,
      });
      if (success) {
        setQuakes((prev) => {
          var previousQuakes = JSON.parse(JSON.stringify(prev));
          var quake;
          for (quake of json.list) {
            previousQuakes[quake.id] = quake;
          }
          console.log("quakes set");
          return previousQuakes;
        });
        setTotalRows(json.total);
        return json.list;
      }
    }

    let active = true;

    (async () => {
      setLoading(true);
      const newRows = (await getQuakes(page + 1, 100)).map((row) => {
        return { ...row, date: row.timeStart, view: row.id };
      });

      if (!active) {
        return;
      }

      setRows(newRows);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [page, setQuakes]);

  return (
    <Fade in>
      <Paper style={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pagination
          pageSize={100}
          rowCount={totalRows}
          paginationMode="server"
          onPageChange={handlePageChange}
          loading={loading}
        />
      </Paper>
    </Fade>
  );
}

export default function Quakes(props) {
  const [quakes, setQuakes] = React.useState({});
  let match = useRouteMatch();
  const path = match.path;

  console.log("render quakes");

  React.useEffect(() => {
    props.setActiveTab(1);
    return;
  }, [props]);

  return (
    <div style={{ height: "90%" }}>
      <Switch>
        <Route path={path + "/:quakeID"}>
          <Quake quakes={quakes} />
        </Route>
        <Route path={path}>
          <QuakesList setQuakes={setQuakes} />
        </Route>
      </Switch>
    </div>
  );
}
