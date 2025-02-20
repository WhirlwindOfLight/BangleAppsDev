{
  let gbSend = require("android").gbSend;
  let storage = require("Storage");
  let systemSettings = storage.readJSON('setting.json', 1);
  // We want to abort if we don't have a good system settings file
  if (("object" != typeof systemSettings) ||
      ("object" != typeof systemSettings.options)) load();
  let androidSettings = storage.readJSON("android.settings.json",1)||{};
  let btStatus = NRF.getSecurityStatus();
  let mainmenu = {
    "" : { "title" : "Android" },
    "< Back" : load,
    /*LANG*/"Bluetooth" : {
      value : btStatus.advertising || btStatus.connected,
      format : v => v?"On":"Off",
      onchange : newValue => {
        try {(newValue?NRF.wake:NRF.sleep)();} catch(e){}
        systemSettings.ble=newValue;
        storage.writeJSON("setting.json", systemSettings);
      }
    },
    /*LANG*/"Find Phone" : () => E.showMenu({
        "" : { "title" : /*LANG*/"Find Phone" },
        "< Back" : ()=>E.showMenu(mainmenu),
        /*LANG*/"On" : _=>gbSend({t:"findPhone",n:true}),
        /*LANG*/"Off" : _=>gbSend({t:"findPhone",n:false}),
      }),
    /*LANG*/"Overwrite GPS" : {
      value : !!androidSettings.overwriteGps,
      onchange: newValue => {
        if (newValue) {
          Bangle.setGPSPower(false, 'android');
        }
        androidSettings.overwriteGps = newValue;
        storage.writeJSON("android.settings.json", androidSettings);
      }
    },
  };
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showMenu(mainmenu);
}