Bangle.loadWidgets();
g.clear(1);
Bangle.drawWidgets();
var R = Bangle.appRect;

var x = 0;
var last;
var max = {c: 1, m:2};
var graphArea = 0.60 // Only use 60% of the drawing area
var wiperWidth = 20;
var abs = Math.abs;

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
Bangle.on('accel', a => {
  g.reset();
  if (abs(a.x) > max.c) {max.c = abs(a.x);}
  if (abs(a.y) > max.c) {max.c = abs(a.y);}
  if (abs(a.z) > max.c) {max.c = abs(a.z);}
  if (a.mag > max.m) {max.m = a.mag;}
  if (x<=g.getWidth()-wiperWidth) {drawWiper(x);}
  if (last) {
    g.setColor("#f00").drawLine(x-1,getY(last.x/max.c),x,getY(a.x/max.c));
    g.setColor("#0f0").drawLine(x-1,getY(last.y/max.c),x,getY(a.y/max.c));
    g.setColor("#00f").drawLine(x-1,getY(last.z/max.c),x,getY(a.z/max.c));
    g.setColor("#fff").drawLine(x-1,getY(last.mag/max.m),x,getY(a.mag/max.m));
  }
  last = a;x++;
  if (x>=g.getWidth()) {x = 1;}
});
