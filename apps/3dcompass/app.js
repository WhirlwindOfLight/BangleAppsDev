const offset = require("Storage").readJSON(
  "magCal.json",
  true
).offset||{x:0,y:0,z:0};
var layout = new (require("Layout"))({
  id: "txt",
  type: "txt",
  font: "12x20",
  label: "North: XXXX\n"+
         " Down: XXXX"
}, {lazy:true});

function toDegrees(radians) {
  return radians * (180/Math.PI);
}

function setText(text) {
  layout.txt.label = text;
  layout.render();
}

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
layout.update();
Bangle.setCompassPower(true, "3D-Compass");
Bangle.on('mag', function(north){
  let x = north.x - offset.x;
  let y = north.y - offset.y;
  let z = north.z - offset.z;

  let r = Math.sqrt(x*x+y*y);
  let nTheta = toDegrees(
    Math.atan2(r,z)
  );

  let dirString = "North: ";
  if (nTheta>90) {
    nTheta -= 180;
    nTheta = Math.abs(nTheta);
    dirString = "South: ";
  }

  let dThetaText = "\n";
  if (nTheta<5) {
    let down = Bangle.getAccel();
    let downR = Math.sqrt(
      down.x*down.x+down.y*down.y
    );
    let dTheta = toDegrees(
      Math.atan2(downR,Math.abs(down.z))
    );
    dThetaText = (
      "\n Down: "+
      String(
        Math.round(dTheta)
      ).padStart(3)+
      "\u00B0"
    );
  }

  setText(
    dirString+
    String(
      Math.round(nTheta)
    ).padStart(3)+
    "\u00B0"+
    dThetaText
  );
});