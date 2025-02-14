{
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let leaveTrace = function(trace) {
    settings.trace = trace;
    storage.writeJSON("quicklaunch.json", settings);
    return trace;
  };

  let launchApp = function(trace) {
    if (settings[trace+"app"].src) {
      if (settings[trace+"app"].name == "Show Launcher") {
        Bangle.showLauncher();
      } else if (!storage.read(settings[trace+"app"].src)) {
        E.showMessage(settings[trace+"app"].src+"\n"+/*LANG*/"was not found"+".", "Quick Launch");
        settings[trace+"app"] = {"name":"(none)"}; // reset entry.
        storage.write("quicklaunch.json", settings);
        setTimeout(load, 2000);
      } else {load(settings[trace+"app"].src);}
    }
  };

  let trace;

  let touchHandler = (_,e) => {
    if (Bangle.CLKINFO_FOCUS) return;
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    trace = leaveTrace("t"); // t=tap
    launchApp(trace);
  };
  let swipeHandler = (lr,ud) => {
    if (Bangle.CLKINFO_FOCUS) return;
    if (lr == -1) trace = leaveTrace("l"); // l=left,
    if (lr == 1) trace = leaveTrace("r"); // r=right,
    if (ud == -1) trace = leaveTrace("u"); // u=up,
    if (ud == 1) trace = leaveTrace("d"); // d=down.
    launchApp(trace);
  };

  Bangle.on("appChanged", (loadedApp)=>{
    Bangle.removeListener('touch', touchHandler);
    Bangle.removeListener('swipe', swipeHandler);
    if (Bangle.CLOCK) {
      if (settings["tapp"].src) {
        Bangle.on("touch", touchHandler);
      }
      Bangle.on("swipe", swipeHandler);
    }
  });
  
}
