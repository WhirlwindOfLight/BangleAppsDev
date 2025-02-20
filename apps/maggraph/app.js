Bangle.loadWidgets();
g.clear(1);
Bangle.drawWidgets();
var R = Bangle.appRect;
var Layout = require("Layout");
var abs = Math.abs;
var gbSend = require("android").gbSend;

var x = 0;
var last;
var baseMax = {x: 200, y: 200, z: 200, mag: 200};
var max = baseMax.clone();
var displayCounter = 0;

var graphArea = 0.60; // Only use 60% of the drawing area
var wiperWidth = 20;
var graphFrozen = false;
var refreshMult = 3; // How many graph updates before a display value update

var color = {
  mag: g.theme.fg,
  x: g.theme.dark ? "#f0f" : "#f00",
  y: g.theme.dark ? "#ff0" : "#0f0",
  z: g.theme.dark ? "#0ff" : "#00f"
};
const calData = require("Storage").readJSON(
  "magCal.json",
  true
)||{};
var offset = calData.offset||{x:0,y:0,z:0};
var scale = calData.scale||{x:1,y:1};

let txt = (myStr, id) => ({ id: id, type: "txt", font: "6x8", label: myStr, fillx: 1});
let vField = (id) => (txt("-#####,", id));
var layout = new Layout({
  type: "v",
  c: [
    { type: "v", c: [
      txt("Values:"),
      { type: "h", c: [
        vField("magVal"),
        txt("("),
        vField("xVal"),
        vField("yVal"),
        vField("zVal"),
        txt(")")
      ]},
    ], filly: 1},
    { height: R.h * graphArea + 2},
    { type: "v", c: [
      txt("Maximums:"),
      { type: "h", c: [
        vField("magMax"),
        txt("("),
        vField("xMax"),
        vField("yMax"),
        vField("zMax"),
        txt(")")
      ]},
    ], filly: 1}
  ]
}, {lazy: true});
layout.update();

function displayValue(myBoxId, value, addComma) {
  addComma = addComma|false;
  layout[myBoxId].label = String(value).padStart(6).substring(0, 6);
  if (addComma) layout[myBoxId].label += ",";
}
function getY(v) {
  return E.clip(-v, -1, 1)*(graphArea)*(R.h/2) + (R.y+R.y2)/2;
}
function drawWiper(v) {
  let v2 = v-1+wiperWidth;
  g.clearRect(v,getY(-1),v2,getY(1))
    .setColor("#777")
    .drawLine(v,getY(0),v2,getY(0))
    .drawLine(v,getY(1),v2,getY(1))
    .drawLine(v,getY(-1),v2,getY(-1));
}
function drawLineSegment(vec, compName) {
  g.setColor(color[compName]).drawLine(
    x-1, getY(last[compName]/max[compName]),
    x, getY(vec[compName]/max[compName]));
}

Bangle.setUI({mode: "updown"},
  (dir) => {
    if (!dir) { // tap or button press
      graphFrozen=!graphFrozen;
    } else { // swipe
      max = baseMax.clone();
    }
  }
);
Bangle.setCompassPower(1, "maggraph");
let intentObj = (myData) => ({t:"intent",action:"com.tasker.banglejs.maggraph",package:"net.dinglisch.android.taskerm",extra:{data:myData}});
Bangle.on('mag', n => {
  n.x = (n.x - offset.x) * scale.x;
  n.y = (n.y - offset.y) * scale.y;
  n.z -= offset.z;
  n.mag = Math.sqrt(n.x*n.x+n.y*n.y+n.z*n.z);
  let a = Bangle.getAccel();
  gbSend(intentObj({
    timestamp: Math.round(Date.now()).toString(),
    mag: {x: n.x, y: n.y, z: n.z},
    accel: {x: a.x, y: a.y, z: a.z},
    graphFrozen: graphFrozen
  }));
  if (graphFrozen) return;
  // Set Maximums
  if (abs(n.x) > max.x) {max.x = abs(n.x);}
  if (abs(n.y) > max.y) {max.y = abs(n.y);}
  if (abs(n.z) > max.z) {max.z = abs(n.z);}
  if (n.mag > max.mag) {max.mag = n.mag;}
  // Display Maximums
  displayValue("magMax", max.mag);
  displayValue("xMax", max.x, true);
  displayValue("yMax", max.y, true);
  displayValue("zMax", max.z);
  // Display Values
  displayValue("magVal", n.mag);
  displayValue("xVal", n.x, true);
  displayValue("yVal", n.y, true);
  displayValue("zVal", n.z);
  // Render Data
  if (!displayCounter) layout.render();
  // Render Graph
  g.reset();
  if (x+wiperWidth<=g.getWidth()) {drawWiper(x);}
  if (last) {
    drawLineSegment(n, "mag");
    drawLineSegment(n, "x");
    drawLineSegment(n, "y");
    drawLineSegment(n, "z");
  }
  // Increment Loop Variables
  last = n;x++;
  displayCounter = (displayCounter + 1) % refreshMult;
  if (x>=g.getWidth()) {
    x = 1;
    drawWiper(0);
  }
});
