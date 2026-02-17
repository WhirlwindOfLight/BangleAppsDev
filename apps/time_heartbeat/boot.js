{
  let lowPower = !!(require("Storage").readJSON("time_heartbeat.json", 1)||{}).lowPower;
  let waitTime = lowPower ? 5000 : 1000;
  let minorBuzz = 0.6;
  let majorBuzz = 0.3;
  let myBuzz = (() => {
    "ram";
    let isMajor = !lowPower && ((new Date()).getSeconds() % 5 == 0);
    Bangle.buzz(50, (isMajor ? majorBuzz : minorBuzz));
  });
  let timeHeartbeat;
  let myTick = (() => {
    "ram";
    myBuzz();
    timeHeartbeat = setTimeout(myTick, waitTime - Date.now() % waitTime);
  });
  /* TODO: Make a settings page to control the blacklist */
  let blackList = ["drained.app.js", "sched.js", "metronome.app.js"];
  Bangle.on("appChanged", (appLoaded)=>{
    if (timeHeartbeat) clearTimeout(timeHeartbeat);
    if (!blackList.includes(appLoaded)) {
      timeHeartbeat = setTimeout(myTick, waitTime - Date.now() % waitTime);
      if (Bangle.CLOCK) {
        majorBuzz = 0.6;
        minorBuzz = 0.3;
      } else {
        majorBuzz = 0.3;
        minorBuzz = 0.1;
      }
    }
  });
}