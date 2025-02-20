{
const DEFAULTS = {
  mode: 0,
  apps: [],
  timeout: 10
};
const settings = require("Storage").readJSON("autoreset.json", 1) || DEFAULTS;
const lockTimeout = require("Storage").readJSON("setting.json").timeout||0;
const timeoutTime = (settings.timeout) ? settings.timeout - lockTimeout : 1;

// Check if the back button should be enabled for the current app.
// app is the src file of the app.
// Derivative of the backswipe app's logic.
function enabledForApp(app) {
  if (Bangle.CLOCK==1) return false;
  if (app === "sched.js") return false;
  if (!settings) return true;
  let isListed = settings.apps.filter((a) => a.files.includes(app)).length > 0;
  return settings.mode===0?!isListed:isListed;
}

let timeoutAutoreset;
let lockHandler = (locked)=>{
  if (locked){
    timeoutAutoreset = setTimeout(()=>{Bangle.showClock();}, timeoutTime);
  } else {
    if (timeoutAutoreset) clearTimeout(timeoutAutoreset);
  }
};
Bangle.on('appChanged', (loadedApp)=>{
  Bangle.removeListener('lock', lockHandler);
  if (timeoutAutoreset) clearTimeout(timeoutAutoreset);
  if (enabledForApp(loadedApp)) {
    Bangle.on('lock', lockHandler);
  }
});
}
