var clock;
{
  /*TODO: Move preferences to settings app*/
  /* Init Functions */
  let getPrefs = function(){
    return {
      useDarkMode: null, /*If null uses system theme*/
      showSeconds: true,
      hourDotSize: 5, /*Should be in range 2-13*/
      color: [
        4, /*Ring*/
        8, /*Text*/
        0  /*Hands*/
      ]
    };
  };

  let selectColors = function(colArr, isDarkMode) {
    isDarkMode = isDarkMode === undefined ? g.theme.dark : isDarkMode;
    let darkPallete = [0xFFFF, 0x0000, 0xFD20, 0x001F, 0xF800, 0x7be0, 0x780F, 0x07E0, 0x07FF, 0x7BEF, 0xFFE0, 0xFFBF00];
    let lightPallete = [0x0000, 0xFFFF, 0xFD20, 0x001F, 0xF800, 0x000F, 0x780F, 0x07E0, 0xFFBF00];
    let myPallete = isDarkMode ? darkPallete : lightPallete;
    return colArr.map(function(i){return myPallete[i];});
  };

  /* Analog Clock Functions */
  let rotatePoint = function(center, point, d) {
    let rad = -1 * d / 180 * Math.PI;
    let sin = Math.sin(rad);
    let cos = Math.cos(rad);
    return {
      x: (((center.x + point.x * cos - point.y * sin) + 0.5) | 0),
      y: (((center.y + point.x * sin - point.y * cos) + 0.5) | 0)
    };
  };

  let drawStaticRing = function(clk) {
    for (var i = 0; i < 60; i++) {
      let myRadius = (i % 5) ? clk.radius.circleM : clk.radius.circleH;
      let point = rotatePoint(clk.center, {x:0, y:clk.radius.ring}, i * 6);
      g.fillCircle(point.x, point.y, myRadius);
    }
  };

  let drawCenterDot = function(clk) {
    g.fillCircle(clk.center.x, clk.center.y, clk.radius.center);
  };

  let drawAnalogHands = function(clk, date) {
    var point = [];
    let minute = date.getMinutes();
    let hour = date.getHours();
    /*Draw new minute hand*/
    point = rotatePoint(clk.center, {x:0, y:clk.radius.min}, minute * 6);
    g.drawLine(clk.center.x, clk.center.y, point.x, point.y);
    g.drawLine(clk.center.x + 1, clk.center.y, point.x + 1, point.y);
    g.drawLine(clk.center.x, clk.center.y + 1, point.x, point.y + 1);
    /*Draw new hour hand*/
    point = rotatePoint(clk.center, {x:0, y:clk.radius.hour}, hour % 12 * 30 + date.getMinutes() / 2 | 0);
    g.drawLine(clk.center.x, clk.center.y, point.x, point.y);
    g.drawLine(clk.center.x + 1, clk.center.y, point.x + 1, point.y);
    g.drawLine(clk.center.x, clk.center.y + 1, point.x, point.y + 1);
  };

  let drawSecondsHand = function(clk, date) {
    let second = date.getSeconds();
    let point = rotatePoint(clk.center, {x:0, y:clk.radius.ring}, second * 6);
    g.drawLine(clk.center.x, clk.center.y, point.x, point.y);
    g.drawLine(clk.center.x + 1, clk.center.y, point.x + 1, point.y);
    g.drawLine(clk.center.x, clk.center.y + 1, point.x, point.y + 1);
  };

  /* Digital Clock Functions */
  let initDigitalClock = function(font, color) {
    /*Modules*/
    let Layout = require("Layout");
    /*Helper Variables*/
    let dFont = "4x6:"+Math.round(g.getHeight() / font.bitDiv);
    let tFont = (prcnt) => (Math.round(prcnt) + "%");
    let txt = function(id, font, label, pad) {
      return {id:id, type:"txt", font:font, label:label,
              pad:pad, col:color.text, bgCol:color.bg};
    };
    /*Time Chunks*/
    let timeArr;
    let dateArr = [
      txt("dow", dFont, "XXXXXX", 1),
      txt("date", dFont, "XXXXXXX", 1),
      {height: Math.round(g.getHeight() * 0.16)},
    ];
    if (clock.is12Hour) {
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
    let myLayout = new Layout({
      type: "v",
      c: dateArr.concat(timeArr)
    });
    let oldAppRect = Bangle.appRect;
    let aw = g.getWidth();
    let ah = g.getHeight();
    Bangle.appRect = {x:0, y:0, w:aw, h:ah, x2:aw-1, y2:ah-1};
    myLayout.update();
    Bangle.appRect = oldAppRect;
    return myLayout;
  };

  let drawDigitalClock = function(clk, date) {
    let Locale = require("locale");
    clk.dow.label = Locale.dow(date, true);
    clk.date.label = (Locale.month(date, true) + ' ' + date.getDate());
    clk.time.label = (Locale.time(date, true));
    if (clk.merid !== undefined) clk.merid.label = Locale.meridian(date);
    clk.render();
  };

  /*InfoObj Functions*/
  let loadWeather = function() {
    let Files = require("Storage");
    return (Files.list().includes("weather")) ? require("weather") : undefined;
  };

  let initInfoObjs = function(scale, padding) {
    let Weather = loadWeather();
    let Layout = require("Layout");
    let Locale = require("locale");
    let myFont = "6x8:" + scale;
    var weatherInfo;
    if (Weather !== undefined) {
      let weatherIconObj = function(diameter, id) {
        let myRadius = Math.round(diameter/2);
        let myRenderFunc = function(l) {
          let myCenter = {
            x: l.x + myRadius,
            y: l.y + myRadius
          };
          Weather.drawIcon(Weather.get(), myCenter.x, myCenter.y, myRadius);
        };
        return {type:"custom", render:myRenderFunc, width:diameter, height:diameter, id:id};
      };

      weatherInfo = {
        type:"v", c: [
          weatherIconObj(20*scale, "wIcon"),
          {type:"txt", font:myFont, label:Locale.temp(300), id:"wTxt"}
        ],
        valign: 1,
        pad: padding,
        id: "wObj"
      };
    } else {
      weatherInfo = {};
    }

    let myInfoObjs = new Layout({
      type: "h", c: [
        weatherInfo,
        {fillx: 1},
        {type:"txt", font:myFont, label:Locale.temp(300), id:"temp",
          valign:1, pad:padding}
      ]
    }, {lazy: true});
    myInfoObjs.update();
    return myInfoObjs;
  };

  let drawInfoObjs = function(infoObjs) {
    let Weather = loadWeather();
    let Locale = require("locale");
    if (Weather !== undefined) {
      let w = (Weather.get() || {});
      let wTemp = (w.temp || NaN) - 273.15;
      infoObjs.wTxt.label = Locale.temp(wTemp);
      infoObjs.wIcon.data = w.code;
    }
    infoObjs.temp.label = "AQI:\n " + require("Storage").read("Ogden_AQI.txt") + " \n ";
    infoObjs.render();
  };

  clock = new (require("ClockFace"))({
    init: function() {
      let prcnt = (n) => (Math.round(g.getWidth() * n / 100));
      this.lastDate = new Date();

      /*Preference Data*/
      let prefs = getPrefs();
      this.showSeconds = prefs.showSeconds;
      let palette = selectColors(
        //Concat for background color
        [1].concat(prefs.color),
        prefs.useDarkMode === null ? g.theme.dark : prefs.useDarkMode
      );
      this.color = {
        bg: palette[0],
        ring: palette[1],
        text: palette[2],
        hands: palette[3]
      };

      /*Initial Clock Data*/
      this.analog = {
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
        }
      };
      this.digital = initDigitalClock(
        {vector: 15, bitDiv: 80 },
        this.color
      );
      this.infoObjs = initInfoObjs(1, 5);

      /*Lock Handler*/
      if (this.showSeconds) {
        if (!Bangle.isLocked()) this.precision = 1;
        this.lockHandler = function(locked) {
          clock.pause();
          clock.precision = locked ? 60 : 1;
          clock.resume();
        };
        Bangle.on('lock', this.lockHandler);
      }
    },
    draw: function(date) {
      this.infoObjs.forgetLazyState(); //Force Redraw to Account for cleared screen
      g.setColor(this.color.ring);
      drawStaticRing(this.analog);
      this.update.apply(this, [date]);
    },
    update: function(date) {
      g.setColor(this.color.bg);
      drawAnalogHands(this.analog, this.lastDate);
      if (this.precision <= 1) {
        drawSecondsHand(this.analog, this.lastDate);
        g.setColor(this.color.ring);
        drawStaticRing(this.analog);
      }
      drawDigitalClock(this.digital, date);
      g.setColor(this.color.hands);
      drawAnalogHands(this.analog, date);
      g.setColor(this.color.ring);
      drawCenterDot(this.analog);
      if (this.precision <= 1) drawSecondsHand(this.analog, date);
      drawInfoObjs(this.infoObjs);
      this.lastDate = date;
    }
  });
  clock.start();
}
