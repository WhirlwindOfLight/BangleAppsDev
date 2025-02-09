Bangle.loadWidgets();
g.clear(1);
Bangle.drawWidgets();
var R = Bangle.appRect;
var Layout = require("Layout");
var abs = Math.abs;

var x = 0;
var last;
var max = {c: 1, m:2};
var displayCounter = 0;

var graphArea = 0.60; // Only use 60% of the drawing area
var wiperWidth = 20;
var graphFrozen = false;
var refreshMult = 3; // How many graph updates before a display value update

var xCol = g.theme.dark ? "#f0f" : "#f00";
var yCol = g.theme.dark ? "#ff0" : "#0f0";
var zCol = g.theme.dark ? "#0ff" : "#00f";

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
  if (a.mag > max.m) {max.m = a.mag;}
  // Display Maximums
  displayValue("magMax", max.m);
  displayValue("xMax", max.c, true);
  displayValue("yMax", max.c, true);
  displayValue("zMax", max.c);
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
    g.setColor(g.theme.fg).drawLine(x-1,getY(last.mag/max.m),x,getY(a.mag/max.m));
    g.setColor(xCol).drawLine(x-1,getY(last.x/max.c),x,getY(a.x/max.c));
    g.setColor(yCol).drawLine(x-1,getY(last.y/max.c),x,getY(a.y/max.c));
    g.setColor(zCol).drawLine(x-1,getY(last.z/max.c),x,getY(a.z/max.c));
  }
  // Increment Loop Variables
  last = a;x++;
  displayCounter = (displayCounter + 1) % refreshMult;
  if (x>=g.getWidth()) {
    x = 1;
    drawWiper(0);
  }
});
