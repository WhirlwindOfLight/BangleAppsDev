const debugMode = false;
const dataCollectRate = 80;
var buttonListening = true;
var dataCounter = 0;
var rawData = [];
var avgs = [];

let txt = (id, myStr, wrap) => ({id: id, type: "txt", font: "12x20", label: myStr, wrap: wrap, fillx:wrap, filly:wrap, bgCol: g.theme.bg});
var layout = new (require("Layout"))({
  type: "v",
  c: [
    txt("instruct", "", true),
    txt("downAngle", "Down: ####")
  ]
});
function showText(text) {
  layout.instruct.label = text;
  layout.render();
  Bangle.buzz(100);
}

function gatherData(duration, callback) {
  rawData[dataCounter] = []; // local data block
  let mySum = {  // vector sum to get the average
    x: 0,
    y: 0,
    z: 0
  };
  let maxDatums = Math.round(duration / dataCollectRate);
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
    (avgs[1].z + avgs[2].z +
    avgs[3].z + avgs[4].z) / 4
  );
  let offset = {
    x: (avgs[2].x + avgs[4].x) / 2,
    y: (avgs[1].y + avgs[3].y) / 2,
    z: (avgUpZ + avgs[5].z) / 2
  };
  let zSample = avgs[0].z - offset.z;
  let scale = {
    x: Math.abs(zSample / (avgs[2].x - offset.x)),
    y: Math.abs(zSample / (avgs[1].y - offset.y))
  }
  if (debugMode) {
    require("Storage").writeJSON(
      "magCal-"+
      (new Date()).toISOString()
        .replaceAll("-", "")
        .replaceAll(":", "")
        .slice(0, 15)+
      ".json",
      {
        offset: offset,
        scale: scale,
        avgs: avgs,
        rawData: rawData
      }
    );
  }
  require("Storage").writeJSON(
    "magCal.json",
    {offset: offset, scale: scale}
  );
}

Bangle.loadWidgets();
g.clear(1);
layout.update();
Bangle.drawWidgets();
Bangle.setCompassPower(1, "magCalibration");
showText("Point watch 90\u00b0 to ground and press the button to start");
let toDegrees = (val) => (val*(180/Math.PI));
Bangle.on('accel', function(a){
  let r = Math.sqrt(a.x*a.x+a.y*a.y);
  let theta = Math.round(toDegrees(Math.atan2(r,-a.z)));
  layout.downAngle.label = (
    "Down: "
    +String(theta).padStart(3)
    +"\u00B0"
  );
  layout.render();
});
Bangle.setUI({
  mode: "custom",
  btn: () => {
    if (buttonListening) {
      buttonListening = false;
      if (dataCounter < 1) {
        showText("Processing...");
        gatherData(1000, () => {
          showText("Hold watch parallel to ground");
          buttonListening = true;
        });
      } else if (dataCounter < 5) {
        showText("Processing...");
        gatherData(1000, () => {
          if (dataCounter < 5) {
            showText("Rotate 90\u00B0\nto the right");
            buttonListening = true;
          } else {
            showText("Point watch\nface down");
            buttonListening = true;
          }
        });
      } else {
        showText("Processing...");
        gatherData(1000, () => {
          compileData();
          showText("Done!");
        });
      }
    }
  }
});