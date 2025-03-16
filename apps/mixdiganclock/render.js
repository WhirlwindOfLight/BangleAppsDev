let initTimerStart = new Date();
/*TODO: Move preferences to settings app*/
function getPrefs(){
  return {
    useDarkMode: null, /*If null uses system theme*/
    showSeconds: true,
    hourDotSize: 5, /*Should be in range 2-13*/
    color: [
      3, /*Ring*/
      7, /*Text*/
      0  /*Hands*/
    ]
  };
}

function selectColors(colArr, isDarkMode) {
  isDarkMode = isDarkMode === undefined ? g.theme.dark : isDarkMode;
  let darkPallete = [0xFFFF, 0xFD20, 0x001F, 0xF800, 0x7be0, 0x780F, 0x07E0, 0x07FF, 0x7BEF, 0xFFE0, 0xFFBF00];
  let lightPallete = [0x0000, 0xFD20, 0x001F, 0xF800, 0x000F, 0x780F, 0x07E0, 0xFFBF00];
  let myPallete = isDarkMode ? darkPallete : lightPallete;
  return colArr.map(function(i){return myPallete[i];});
}

function rotatePoint(center, point, d) {
  let rad = -1 * d / 180 * Math.PI;
  let sin = Math.sin(rad);
  let cos = Math.cos(rad);
  return {
    x: (((center.x + point.x * cos - point.y * sin) + 0.5) | 0),
    y: (((center.y + point.x * sin - point.y * cos) + 0.5) | 0)
  };
}

function initStaticRing(clk) {
  let imgRadius = Math.ceil(clk.radius.ring + clk.radius.circleH);
  let imgDiameter = imgRadius*2+1;
  let imgCenter = {x:imgRadius, y:imgRadius};
  let ovr = Graphics.createArrayBuffer(imgDiameter,imgDiameter,1,{msb:true});
  ovr.transparent = 0;
  for (var i = 0; i < 60; i++){
    let myRadius = (i % 5) ? clk.radius.circleM : clk.radius.circleH;
    let point = rotatePoint(imgCenter, {x:0, y:clk.radius.ring}, i * 6);
    ovr.fillCircle(point.x, point.y, myRadius);
  }
  require("Storage").write("mixdiganclock.ring.img", ovr.asImage("string"));
  return {x:clk.center.x-imgRadius, y:clk.center.y-imgRadius};
}

function initDigitalClock(font, is12Hour) {
  /*Helper Variables*/
  let dFont = "4x6:"+Math.round(g.getHeight() / font.bitDiv);
  let tFont = (prcnt) => (Math.round(prcnt) + "%");
  let txt = function(id, font, label, pad) {
    return {id:id, type:"txt", font:font, label:label, pad:pad};
  };
  /*Time Chunks*/
  let timeArr;
  let dateArr = [
    txt("dow", dFont, "XXXXXX", 1),
    txt("date", dFont, "XXXXXXX", 1),
    {height: Math.round(g.getHeight() * 0.16)},
  ];
  if (is12Hour) {
    timeArr = [
      txt("time", tFont(font.vector*0.625), "XX:XX"),
      txt("merid", tFont(font.vector*0.375), "XXXX")
    ];
  } else {
    timeArr = [
      txt("time", tFont(font.vector), "XX:XX")
    ];
  }
  /*Complete and return the layout*/
  let myLayout = new (require("Layout"))({
    type: "v",
    c: dateArr.concat(timeArr)
  });
  myLayout.update();
  let getObj = (l)=>({
    x:l.x+l.w/2,
    y:l.y+l.h/2,
    font:l.font
  });
  return {
    dow: getObj(myLayout.dow),
    date: getObj(myLayout.date),
    time: getObj(myLayout.time),
    merid: is12Hour ? getObj(myLayout.merid) : undefined,
    textColor: color.text
  };
}

function initInfoObjs() {
  let clockInfoBox = (id)=>({
    width:40, height:39, valign:1, id:id
  });
  let myInfoObjs = new (require("Layout"))({
    type: "h", c: [
      clockInfoBox("wObj"),
      {fillx: 1},
      clockInfoBox("aqiObj"),
      {width: 1}
    ]
  }, {lazy: true});
  myInfoObjs.update();
  let getObj = (l)=>({x:l.x, y:l.y, w:l.w, h:l.h});
  return [
    getObj(myInfoObjs.wObj),
    getObj(myInfoObjs.aqiObj)
  ];
}

let prcnt = (n) => (Math.round(g.getWidth() * n / 100));

/*Load Preference Data*/
let prefs = getPrefs();
let palette = selectColors(
  prefs.color,
  prefs.useDarkMode === null ? g.theme.dark : prefs.useDarkMode
);
let color = {
  ring: palette[0],
  text: palette[1],
  hands: palette[2]
};

/*Set Clock Data*/
var clock = {
  prerendered: {
    darkTheme: prefs.useDarkMode === null ? g.theme.dark : undefined,
    is12Hour: (require("Storage").readJSON("setting.json",1)||{})["12hour"]
  },
  showSeconds: prefs.showSeconds
};
clock.analog = {
  center: {
    x: g.getWidth() / 2,
    y: g.getHeight() / 2
  },
  radius: {
    "center": prcnt(3),
    "hour": prcnt(20),
    "min": prcnt(28.4),
    "ring": prcnt(34.1),
    "circleH": prefs.hourDotSize,
    "circleM": 2
  },
  color: {ring: color.ring, hands: color.hands}
};
clock.analog.staticRing = initStaticRing(clock.analog);
clock.digital = initDigitalClock(
  {vector: 15, bitDiv: 80 },
  clock.prerendered.is12Hour
);
clock.digital.textColor = color.text;
clock.clockInfoBoxes = initInfoObjs();
require("Storage").writeJSON("mixdiganclock.layout.json", clock);
print("prerender -> "+Math.round((new Date()) - initTimerStart)+" ms");
// We aren't allowed to load immediatly after loading,
// so we need to wait a bit to go back to the clock
setTimeout(load, 10);
