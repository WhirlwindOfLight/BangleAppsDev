(function(back) {
  var FILE="fastload.json";
  var settings;
  var isQuicklaunchPresent = !!require('Storage').read("quicklaunch.app.js", 0, 1);

  function writeSettings(key, value) {
    var s = require('Storage').readJSON(FILE, true) || {};
    s[key] = value;
    require('Storage').writeJSON(FILE, s);
    readSettings();
  }

  function readSettings(){
    settings = require('Storage').readJSON(FILE, true) || {};
    settings.apps = settings.apps||[];
  }

  readSettings();

  function buildMainMenu(){
    var mainmenu = {};

    mainmenu[''] = { 'title': 'Fastload', back: back };

    mainmenu['Activate app history'] = {
        value: !!settings.useAppHistory,
        onchange: v => {
          writeSettings("useAppHistory",v);
          if (v && settings.autoloadLauncher) {
            writeSettings("autoloadLauncher",!v);  // Don't use app history and load to launcher together.
            setTimeout(()=>E.showMenu(buildMainMenu()), 0); // Update the menu so it can be seen if a value was automatically set to false (app history vs load launcher).
          }
        }
      };

    if (isQuicklaunchPresent) {
      mainmenu['Exclude Quick Launch from history'] = {
        value: !!settings.disregardQuicklaunch,
        onchange: v => {
          writeSettings("disregardQuicklaunch",v);
        }
      };
    }

    mainmenu['Force load to launcher'] = {
        value: !!settings.autoloadLauncher,
        onchange: v => {
          writeSettings("autoloadLauncher",v);
          if (v && settings.useAppHistory) {
            writeSettings("useAppHistory",!v);
            setTimeout(()=>E.showMenu(buildMainMenu()), 0); // Update the menu so it can be seen if a value was automatically set to false (app history vs load launcher).
          } // Don't use app history and load to launcher together.
        }
      };

    mainmenu['Hide "Fastloading..."'] = {
        value: !!settings.hideLoading,
        onchange: v => {
          writeSettings("hideLoading",v);
        }
      };

      mainmenu['Detect settings changes'] = {
         value: !!settings.detectSettingsChange,
         onchange: v => {
           writeSettings("detectSettingsChange",v);
         }
      };

      mainmenu['Whitelist'] = ()=>showAppSubMenu();

    return mainmenu;
  }

  var showAppSubMenu = function() {
    var menu = {
      '': { 'title': 'Fastload Utils' },
      '< Back': () => {
        showMainMenu();
      },
      'Add App': () => {
        showAppList();
      }
    };
    settings.apps.forEach(app => {
      menu[app.name] = () => {
        settings.apps.splice(settings.apps.indexOf(app), 1);
        writeSettings("apps", settings.apps);
        showAppSubMenu();
      }
    });
    E.showMenu(menu);
  };

  var showAppList = function() {
    var apps = getApps();
    var menu = {
      '': { 'title': 'Fastload Utils' },
      /*LANG*/'< Back': () => {
        showMainMenu();
      }
    };
    apps.forEach(app => {
      menu[app.name] = () => {
        settings.apps.push(app); 
        writeSettings("apps", settings.apps);
        showAppSubMenu();
      }
    });
    E.showMenu(menu);
  };

  // Get all app info files
  var getApps = function() {
    var apps = require('Storage').list(/\.info$/).map(appInfoFileName => {
      var appInfo = require('Storage').readJSON(appInfoFileName, 1);
      return appInfo && {
        'name': appInfo.name,
        'sortorder': appInfo.sortorder,
        'src': appInfo.src,
        'files': appInfo.files
      };
    }).filter(app => app && !!app.src);
    apps.sort((a, b) => {
      var n = (0 | a.sortorder) - (0 | b.sortorder);
      if (n) return n; // do sortorder first
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
    return apps;
  };

  let showMainMenu = ()=>E.showMenu(buildMainMenu());
  showMainMenu();
})
