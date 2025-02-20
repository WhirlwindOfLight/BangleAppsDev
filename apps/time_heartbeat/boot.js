{
  let lowPower = !!(require("Storage").readJSON("time_heartbeat.json", 1)||{}).lowPower;
  let waitTime = lowPower ? 5000 : 1000;
  let myBuzz = (() => {
    let isMajor = !lowPower && ((new Date()).getSeconds() % 5 == 0);
    if (!Bangle.isCharging())
      Bangle.buzz(50, Bangle.CLOCK ? (isMajor ? 0.6 : 0.3) : (isMajor ? 0.3 : 0.1));
  });
  let timeHeartbeat;
  let myTick = (() => {
    myBuzz();
    if (!(typeof __FILE__ !== "undefined" && __FILE__ == "drained.app.js")) timeHeartbeat = setTimeout(myTick, waitTime - Date.now() % waitTime);
  });
  if (!(typeof __FILE__ !== "undefined" && __FILE__ == "drained.app.js")) timeHeartbeat = setTimeout(myTick, waitTime - Date.now() % waitTime);
  // TODO: Fix "drained" handler
  //Bangle.on("drained", ()=>clearTimeout(timeHeartbeat));
}