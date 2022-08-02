import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import HourglassEmptyIcon from "@material-ui/icons/HourglassEmpty";
import SignalCellular3BarIcon from "@material-ui/icons/SignalCellular3Bar";
import SignalCellular4BarIcon from "@material-ui/icons/SignalCellular4Bar";
import SignalCellularConnectedNoInternet0BarIcon from "@material-ui/icons/SignalCellularConnectedNoInternet0Bar";
import SignalCellularConnectedNoInternet1BarIcon from "@material-ui/icons/SignalCellularConnectedNoInternet1Bar";
import SignalCellularConnectedNoInternet2BarIcon from "@material-ui/icons/SignalCellularConnectedNoInternet2Bar";
import TimelineIcon from "@material-ui/icons/Timeline";
import React from "react";
import ReactDOM from "react-dom";
import { useMeasure } from "react-use";
import {
  DiscreteColorLegend,
  HorizontalGridLines,
  LineSeriesCanvas,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";
import "../App.css";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import { io } from "socket.io-client";
import ReplayIcon from "@material-ui/icons/Replay";

export default function LiveData(props) {
  const [hundredthData, setHundredthData] = React.useState({
    EHZ: [],
    ENE: [],
    ENN: [],
    ENZ: [],
  });
  const [quarterlyData, setQuarterlyData] = React.useState({
    average: [],
    offset: [],
    threshold: [],
  });
  const [timeDifferences, setTimeDifferences] = React.useState([]);
  const [latency, setLatency] = React.useState(0);
  const [shaking, setShaking] = React.useState(false);
  const [detrendTime, setDetrendTime] = React.useState(2000);
  const [sixRef, sixMeasurements] = useMeasure();
  const [eightRef, eightMeasurements] = useMeasure();

  React.useEffect(() => {
    props.setActiveTab(3);
    window.lastMessage = 0;
    var socket = io(window.location.origin, {
      extraHeaders: {
        Authorization: window.user.token,
      },
    });
    socket.emit("listen raw");
    socket.on("raw data", (msg) => {
      ReactDOM.unstable_batchedUpdates(() => {
        if (msg.timestamp - window.lastMessage < 100000) {
          setTimeDifferences((prev) => {
            var last99 = prev.slice(0, 79);
            last99.unshift(msg.timestamp);
            return last99;
          });
        }
        setLatency(Date.now() - msg.timestamp);
        setDetrendTime(msg.detrendTime);
        setShaking(msg.shaking);
        setQuarterlyData((prev) => {
          var newRawData = {};
          for (var channel of ["average", "offset", "threshold"]) {
            newRawData[channel] = prev[channel].filter(
              (x) => x.time > msg.timestamp - 100000
            );
            newRawData[channel].push({
              time: msg.timestamp,
              value:
                (channel === "threshold" ? msg.threshold : msg[channel]) / 1000,
            });
          }
          return newRawData;
        });
        setHundredthData((prev) => {
          var newRawData = {};
          var channel;
          for (channel of Object.keys(msg.data)) {
            newRawData[channel] = prev[channel].filter(
              (x) => x.time > msg.timestamp - 20000
            );
            var i;
            for (i in msg.data[channel]) {
              newRawData[channel].push({
                time: msg.timestamp + i * 10,
                value: msg.data[channel][i] / 1000,
              });
            }
          }
          return newRawData;
        });
      });
      window.lastMessage = msg.timestamp;
    });

    return () => {
      socket.emit("disconnect raw");
      socket.off("raw data");
      socket.disconnect();
    };
  }, [props]);

  // var goodTimes = timeDifferences.filter(x => x === 250).length
  // var badTimes = timeDifferences.length - goodTimes

  var percentRecieved =
    timeDifferences.length /
    ((Math.max(...timeDifferences) - Math.min(...timeDifferences)) / 250 + 1);

  window.hundredthData = hundredthData;
  window.quarterlyData = quarterlyData;

  var maxTime = {
    EHZ: Math.max(...hundredthData.EHZ.map((x) => x.time)),
    ENE: Math.max(...hundredthData.ENE.map((x) => x.time)),
    ENN: Math.max(...hundredthData.ENN.map((x) => x.time)),
    ENZ: Math.max(...hundredthData.ENZ.map((x) => x.time)),
    average: Math.max(...quarterlyData.average.map((x) => x.time)),
    offset: Math.max(...quarterlyData.offset.map((x) => x.time)),
    threshold: Math.max(...quarterlyData.threshold.map((x) => x.time)),
  };

  return (
    <Fade in>
      <div>
        <Grid container spacing={3} style={{ paddingBottom: "-20px" }}>
          <Grid item xs={4}>
            <Typography variant="h6">Connection:</Typography>
            <div style={{ paddingLeft: "10px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {percentRecieved === 0 ? (
                  <SignalCellularConnectedNoInternet0BarIcon />
                ) : percentRecieved < 0.5 ? (
                  <SignalCellularConnectedNoInternet1BarIcon />
                ) : percentRecieved < 0.8 ? (
                  <SignalCellularConnectedNoInternet2BarIcon />
                ) : percentRecieved < 0.9 ? (
                  <SignalCellular3BarIcon />
                ) : (
                  <SignalCellular4BarIcon />
                )}
                <Typography variant="body1" style={{ marginLeft: "10px" }}>
                  {percentRecieved === 0
                    ? "Connecting..."
                    : Math.round(percentRecieved * 100).toString() +
                      "% of packets recieved"}
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
                  Latency: {Math.round(latency / 100) / 10} second
                  {Math.round(latency / 100) / 10 === 1 ? "" : "s"}
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <FlashOnIcon />
                <Typography variant="body1" style={{ marginLeft: "10px" }}>
                  Threshold met: {shaking.toString()}
                </Typography>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <TimelineIcon />
                <Typography variant="body1" style={{ marginLeft: "10px" }}>
                  EHZ average / offset:{" "}
                  {quarterlyData.offset.length !== 0 &&
                    Math.round(
                      quarterlyData.offset[quarterlyData.offset.length - 1]
                        .value
                    )}{" "}
                  M EHZ / 10 ms
                </Typography>
              </div>

              <Button
                onClick={() => {
                  window.callAPI("offset", "DELETE");
                }}
                color="primary"
                variant="outlined"
                style={{ marginTop: 5 }}
                disabled={window.user.permissions.live !== 0}
                startIcon={<ReplayIcon />}
              >
                Reset offset
              </Button>
              <Typography style={{ marginTop: "10px" }} variant="body1">
                All y-axis represent strength in thousand counts per 10
                milliseconds
              </Typography>
            </div>
          </Grid>

          <Grid item xs={8}>
            <Paper
              ref={eightRef}
              style={{
                paddingLeft: "10px",
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h6" style={{ marginLeft: "40%" }}>
                Detrended EHZ
              </Typography>
              <XYPlot
                width={eightMeasurements.width - 210}
                height={190}
                // style={{ width: "500px", height: "200px" }}
              >
                <VerticalGridLines />
                <HorizontalGridLines />
                <XAxis title="Time (seconds)" />
                <YAxis />
                <LineSeriesCanvas
                  strokeWidth={1}
                  color="#0D676C"
                  data={quarterlyData.average.map((i) => ({
                    x: (maxTime.average - i.time) / 1000,
                    y: i.value,
                  }))}
                />
                {/* <LineSeriesCanvas strokeWidth={1} color="#B52F93" data={quarterlyData.offset.map(i => ({ x: (maxTime.offset - i.time) / 1000, y: i.value }))} /> */}
                <LineSeriesCanvas
                  strokeWidth={1}
                  color="#000000"
                  data={quarterlyData.threshold.map((i) => ({
                    x: (maxTime.threshold - i.time) / 1000,
                    y: i.value,
                  }))}
                />
              </XYPlot>
              <DiscreteColorLegend
                orientation="vertical"
                width={200}
                items={[
                  { title: "Threshold for quake", color: "#000000" },
                  {
                    title: "Average of detrended EHZ over 0.25s",
                    color: "#0D676C",
                  },
                ]}
              />
            </Paper>
          </Grid>

          {Object.keys(hundredthData).map((channel) => (
            <Grid item xs={6}>
              <Paper style={{ paddingLeft: "10px" }}>
                <Typography variant="h6" style={{ marginLeft: "40%" }}>
                  Channel {channel}
                </Typography>
                <XYPlot width={sixMeasurements.width - 20} height={190}>
                  <VerticalGridLines />
                  <HorizontalGridLines />
                  <XAxis title="Time (seconds)" />
                  <YAxis />
                  <LineSeriesCanvas
                    strokeWidth={1}
                    data={hundredthData[channel].map((i) => ({
                      x: (maxTime[channel] - i.time) / 1000,
                      y: i.value,
                    }))}
                  />
                </XYPlot>
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
