{
  let storage = require("Storage");
  let settings = storage.readJSON("time_heartbeat.json", 1)||{};
  settings.lowPower = !settings.lowPower;
  storage.writeJSON("time_heartbeat.json", settings);
  E.showMessage("[Heartbeat]\nLow Power Mode\n" + (settings.lowPower?"Enabled":"Disabled"));
  setTimeout(load, 2000);
}