var clock;
{
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
    let point = clk.staticRing;
    g.setColor(clk.color.ring)
        .drawImage(require("Storage").read("mixdiganclock.ring.img"),
                   point.x, point.y);
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
    g.setColor(g.theme.bg)
      .fillCircle(clk.center.x, clk.center.y, radius);
    if (showingSeconds) {
      drawStaticRing(clk);
    }
  };

  /* Digital Clock Functions */
  let drawDigitalClock = function(clk, date) {
    let Locale = require("locale");
    g.setColor(clk.textColor).setFontAlign(0,0)
    .setFont(clk.dow.font).drawString(
      Locale.dow(date, true),
      clk.dow.x,clk.dow.y)
    .setFont(clk.date.font).drawString(
      Locale.month(date, true)+' '+date.getDate(),
      clk.date.x,clk.date.y)
    .setFont(clk.time.font).drawString(
      Locale.time(date, true),
      clk.time.x,clk.time.y);
    if (clk.merid !== undefined)
      g.setFont(clk.merid.font).drawString(
        Locale.meridian(date),
        clk.merid.x,clk.merid.y);
  };

  /*InfoObj Functions*/
  let clockInfoDraw = (itm, info, options) => {
    /* Define and clean the drawing area */
    let myRect = {
      x:options.x, y:options.y,
      w:options.w, h:options.h
    };
    g.reset().clearRect(myRect);
    if (options.focus) g.drawRect(myRect);

    /* Apply padding to the rectangle directly
        Note: this is a local copy, and does not
              affect the original clockinfo
    */
    let padding = 5;
    myRect.x += padding;
    myRect.y += padding;
    myRect.w -= padding*2;
    myRect.h -= padding*2;

    /* Define sections by percent of height */
    let prcnt = (n) => (Math.round(myRect.h * n / 100));
    let imgHeight = prcnt(70);
    // 3.4% padding in the middle
    let txtHeight = prcnt(27.6);
    let myFont = (txtHeight % 8 == 0)
      ? "6x8:"+(txtHeight/8)
      : "Vector:"+txtHeight;

    /* Draw the image and text */
    if (info.img) {
      let imgBaseHeight = 24;
      let imgOffset = (myRect.w-imgHeight)/2;
      if (info.color) g.setColor(info.color);
      g.drawImage(info.img,
                  myRect.x+imgOffset, 
                  myRect.y,
                  {scale:imgHeight / imgBaseHeight});
    }
    g.reset().setFont(myFont).setFontAlign(0, 1).drawString(
      info.text,
      myRect.x+(myRect.w/2),
      myRect.y+(myRect.h)
    );
  };

  clock = new (require("ClockFace"))({
    settingsFile: "mixdiganclock.layout.json",
    init: function() {
      /*Check for pre-render*/
      if (!(
        // If the following is true, we *don't* need to prerender:
        this.prerendered !== undefined
        && (this.prerendered.is12hour == this.is12hour)
        && (this.prerendered.darkTheme === undefined
           || this.prerendered.darkTheme == g.theme.dark)
      )) setTimeout(()=>load("mixdiganclock.render.js"), 3000);
      // load on a timeout to mitigate loading loops
      
      /*Load clockinfos*/
      let clockInfoItems = require("clock_info").load();
      this.clockInfoObjs = this.clockInfoBoxes.map((rect)=>
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
    },
    remove: function() {
      Bangle.removeListener('lock', this.lockHandler);
      this.clockInfoObjs.forEach((obj)=>obj.remove());
      clock = undefined;
      delete clock;
    },
    draw: function(date) {
      drawStaticRing(this.analog);
      this.clockInfoObjs.forEach((obj)=>obj.redraw());
      this.update.apply(this, [date]);
    },
    update: function(date) {
      clearAnalog(this.analog, (this.precision <= 1));
      drawDigitalClock(this.digital, date);
      drawAnalogHands(this.analog, date);
      drawCenterDot(this.analog);
      if (this.precision <= 1) drawSecondsHand(this.analog, date);
    }
  });
  clock.start();
}
