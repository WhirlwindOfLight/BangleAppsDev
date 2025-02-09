Bangle.loadWidgets();
g.clear(1);
Bangle.drawWidgets();
var R = Bangle.appRect;
var Layout = require("Layout");
var abs = Math.abs;

var x = 0;
var last;
var max = {c: 1, mag:2};
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
}

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

Bangle.setUI({
  mode: "custom",
  btn: () => {graphFrozen=!graphFrozen;}
});
Bangle.on('accel', a => {
  if (graphFrozen) return;
  // Set Maximums
  if (abs(a.x) > max.c) {max.c = abs(a.x);}
  if (abs(a.y) > max.c) {max.c = abs(a.y);}
  if (abs(a.z) > max.c) {max.c = abs(a.z);}
  if (a.mag > max.mag) {max.mag = a.mag;}
  max.x = max.y = max.z = max.c;
  // Display Maximums
  displayValue("magMax", max.mag);
  displayValue("xMax", max.x, true);
  displayValue("yMax", max.y, true);
  displayValue("zMax", max.z);
  // Display Values
  displayValue("magVal", a.mag);
  displayValue("xVal", a.x, true);
  displayValue("yVal", a.y, true);
  displayValue("zVal", a.z);
  // Render Data
  if (!displayCounter) layout.render();
  // Render Graph
  g.reset();
  if (x+wiperWidth<=g.getWidth()) {drawWiper(x);}
  if (last) {
    drawLineSegment(a, "mag");
    drawLineSegment(a, "x");
    drawLineSegment(a, "y");
    drawLineSegment(a, "z");
  }
  // Increment Loop Variables
  last = a;x++;
  displayCounter = (displayCounter + 1) % refreshMult;
  if (x>=g.getWidth()) {
    x = 1;
    drawWiper(0);
  }
});
