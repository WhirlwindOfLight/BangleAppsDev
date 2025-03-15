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
      g.setColor(clk.color.ring)
        .fillCircle(point.x, point.y, myRadius);
    }
  };

  let drawCenterDot = function(clk) {
    g.setColor(clk.color.ring)
      .fillCircle(clk.center.x, clk.center.y, clk.radius.center);
  };

  let drawAnalogHands = function(clk, date) {
    let minute = date.getMinutes();
    let hour = date.getHours();
    let pointM = rotatePoint(clk.center, {x:0, y:clk.radius.min}, minute * 6);
    let pointH = rotatePoint(clk.center, {x:0, y:clk.radius.hour}, hour % 12 * 30 + date.getMinutes() / 2 | 0);
    g.setColor(clk.color.hands)
    /*Draw new minute hand*/
      .drawLine(clk.center.x, clk.center.y, pointM.x, pointM.y)
      .drawLine(clk.center.x + 1, clk.center.y, pointM.x + 1, pointM.y)
      .drawLine(clk.center.x, clk.center.y + 1, pointM.x, pointM.y + 1)
    /*Draw new hour hand*/
      .drawLine(clk.center.x, clk.center.y, pointH.x, pointH.y)
      .drawLine(clk.center.x + 1, clk.center.y, pointH.x + 1, pointH.y)
      .drawLine(clk.center.x, clk.center.y + 1, pointH.x, pointH.y + 1);
  };

  let drawSecondsHand = function(clk, date) {
    let second = date.getSeconds();
    let point = rotatePoint(clk.center, {x:0, y:clk.radius.ring}, second * 6);
    g.setColor(clk.color.ring)
      .drawLine(clk.center.x, clk.center.y, point.x, point.y)
      .drawLine(clk.center.x + 1, clk.center.y, point.x + 1, point.y)
      .drawLine(clk.center.x, clk.center.y + 1, point.x, point.y + 1);
  };

  let clearAnalog = function(clk, showingSeconds) {
    let radius = showingSeconds ? clk.radius.ring : clk.radius.min+1;
    g.setColor(clk.color.bg)
      .fillCircle(clk.center.x, clk.center.y, radius);
    if (showingSeconds) {
      drawStaticRing(clk);
    }
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
  let clockInfoDraw = (itm, info, options) => {
    let myRect = {
      x:options.x, y:options.y,
      w:options.w, h:options.h
    };
    g.reset().clearRect(myRect);
    if (options.focus) g.drawRect(myRect);

    /* TODO: Account for potential scaling of the clockInfo
      For now we will assume we have a 40x39 pixel area with 5 pixel padding
      included, as such that the vertical layers are:
        * 5px padding
        * 20px centered image (20x20)
        * 1px padding
        * 8px centered text
        * 5px padding
      Note that the image needs an additional 5px horizontal offset to be centered
    */
    let padding = 5;
    let imgDiameter = 20;
    if (info.img) {
      let imgBaseDiameter = 24;
      let imgOffset = 5;
      if (info.color) g.setColor(info.color);
      g.drawImage(info.img,
                  options.x+padding+imgOffset, 
                  options.y+padding,
                  {scale:imgDiameter / imgBaseDiameter});
    }
    g.reset().setFont("6x8").setFontAlign(0, 1).drawString(
      info.text,
      options.x+(options.w/2),
      options.y+(options.h-padding)
    );
  };

  let initInfoObjs = function() {
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
    let la = myInfoObjs.wObj;
    let lb = myInfoObjs.aqiObj;
    return [
      {x:la.x, y:la.y, w:la.w, h:la.h},
      {x:lb.x, y:lb.y, w:lb.w, h:lb.w}
    ];
  };

  clock = new (require("ClockFace"))({
    init: function() {
      let timerStart = new Date();
      let prcnt = (n) => (Math.round(g.getWidth() * n / 100));

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
        },
        color: this.color
      };
      this.digital = initDigitalClock(
        {vector: 15, bitDiv: 80 },
        this.color
      );
      let clockInfoItems = require("clock_info").load();
      this.clockInfoObjs = initInfoObjs().map((rect)=>
        require("clock_info").addInteractive(clockInfoItems, {
          app:"mixdiganclock",
          x:rect.x, y:rect.y-1, w:rect.w, h:rect.h,
          draw: clockInfoDraw
        })
      );

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
      print("init -> "+Math.round((new Date()) - timerStart)+" ms");
    },
    draw: function(date) {
      let timerStart = new Date();
      drawStaticRing(this.analog);
      this.clockInfoObjs.forEach((obj)=>obj.redraw());
      this.update.apply(this, [date]);
      print("draw -> "+Math.round((new Date()) - timerStart)+" ms");
    },
    update: function(date) {
      let timerStart = new Date();
      clearAnalog(this.analog, (this.precision <= 1));
      drawDigitalClock(this.digital, date);
      drawAnalogHands(this.analog, date);
      drawCenterDot(this.analog);
      if (this.precision <= 1) drawSecondsHand(this.analog, date);
      print("update -> "+Math.round((new Date()) - timerStart)+" ms");
    }
  });
  clock.start();
}
