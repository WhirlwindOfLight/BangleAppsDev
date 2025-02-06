const dataCollectRate = 100;
var buttonListening = true;
var dataCounter = 0;
var rawData = [];
var avgs = [];

function showText(text) {
  E.showMessage(text);
  Bangle.drawWidgets();
  Bangle.buzz(100);
}

function gatherData(duration, callback) {
  rawData[dataCounter] = []; // local data block
  let mySum = {  // vector sum to get the average
    x: 0,
    y: 0,
    z: 0
  };
  let maxDatums = duration / dataCollectRate;
  let datumCounter = 0;
  let gatherDatum = () => {
    let myDatum = Bangle.getCompass();
    rawData[dataCounter][datumCounter] = {
      x: myDatum.x,
      y: myDatum.y,
      z: myDatum.z
    };
    mySum.x += myDatum.x;
    mySum.y += myDatum.y;
    mySum.z += myDatum.z;
    datumCounter++;
    if (datumCounter < maxDatums) {
      setTimeout(gatherDatum, dataCollectRate);
    } else {
      avgs[dataCounter] = {
        x: mySum.x / datumCounter,
        y: mySum.y / datumCounter,
        z: mySum.z / datumCounter
      };
      dataCounter++;
      callback();
    }
  };
  gatherDatum();
}

function compileData() {
  let avgUpZ = (
    (avgs[0].z + avgs[1].z +
    avgs[2].z + avgs[3].z) / 4
  );
  let offset = {
    x: (avgs[1].x + avgs[3].x) / 2,
    y: (avgs[0].y + avgs[2].y) / 2,
    z: (avgUpZ + avgs[4].z) / 2
  };
  require("Storage").writeJSON(
    ("magCal-"+(new Date()).toISOString()).slice(0, 23)+".json",
    {
      offset: offset,
      avgs: avgs,
      rawData: rawData
    }
  );
  require("Storage").writeJSON(
    "magCal.json",
    {offset: offset}
  );
}

Bangle.loadWidgets();
Bangle.setUI({
  mode: "custom",
  btn: () => {
    if (buttonListening) {
      buttonListening = false;
      if (dataCounter < 4) {
        showText("Wiggle watch\nside-to-side");
        gatherData(2000, () => {
          if (dataCounter < 4) {
            showText("Rotate 90\u00B0\nto the right");
            buttonListening = true;
          } else {
            showText("Point watch\nface down");
            buttonListening = true;
          }
        });
      } else {
        showText("Processing...");
        gatherData(2000, () => {
          compileData();
          showText("Done!");
        });
      }
    }
  }
});
Bangle.setCompassPower(1, "magCalibration");
showText("Keep watch\nparallel to ground\nand face North");