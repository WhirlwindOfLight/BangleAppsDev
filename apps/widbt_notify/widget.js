{
  // load settings
  let settings = Object.assign({
    showWidget: true,
    buzzOnConnect: true,
    buzzOnLoss: true,
    hideConnected: true,
    showMessage: true,
    nextBuzz: 30000
  }, require("Storage").readJSON("widbt_notify.json", true) || {});

  // setup widget with to hide if connected and option set
  let widWidth;
  if (settings.hideConnected) {
    widWidth = NRF.getSecurityStatus().connected ? 0 : 15;
  } else {
    let btStatus = NRF.getSecurityStatus();
    widWidth = (btStatus.connected || btStatus.advertising) ? 15 : 0;
  }

  let lastConnect = NRF.getSecurityStatus().connected; // Keep track of the last connection state so we can tell the difference between a connection shift and BT being toggled

  // write widget with loaded settings
  WIDGETS.bluetooth_notify = Object.assign(settings, {

    // set area and width
    area: "tr",
    width: widWidth,

    // setup warning status
    warningEnabled: 1,

    draw: function() {
      if (this.showWidget) {
        g.reset();
        let btStatus = NRF.getSecurityStatus();
        if (btStatus.connected) {
          if (!this.hideConnected) {
            g.setColor((g.getBPP() > 8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
            g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
          }
        } else if (btStatus.advertising) {
          // g.setColor(g.theme.dark ? "#666" : "#999");
          g.setColor("#f00"); // red is easier to distinguish from blue
          g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="), 2 + this.x, 2 + this.y);
        }
      }
    },

    onNRF: function(connect) {
      // setup widget with and reload widgets to show/hide if hideConnected is enabled
      let connectionShift = (!!connect || lastConnect) && !(!!connect && lastConnect);
      lastConnect = !!connect;
      if (this.hideConnected) {
        widWidth = connect  ? 0 : 15;
      } else {
        let adMode = NRF.getSecurityStatus().advertising;
        widWidth = (connect || adMode) ? 15 : 0;
      }
      if (this.width !== widWidth) {
        this.width = widWidth;
        Bangle.drawWidgets();
      } else {
        // redraw widget
        this.draw();
      }

      if (this.warningEnabled) {
        if (this.showMessage && connectionShift) {
          require("notify").show({id:"widbtnotify", title:"Bluetooth", body:/*LANG*/ 'Connection\n' + (connect ? /*LANG*/ 'restored.' : /*LANG*/ 'lost.')});
          setTimeout(() => {
            require("notify").hide({id:"widbtnotify"});
          }, 3000);
        }

        this.warningEnabled = 0;
        setTimeout('WIDGETS.bluetooth_notify.warningEnabled = 1;', this.nextBuzz); // don't buzz for the next X seconds.

        var quiet = (require('Storage').readJSON('setting.json', 1) || {}).quiet;
        if (!quiet && connectionShift && (connect ? this.buzzOnConnect : this.buzzOnLoss)) {
          Bangle.buzz(700, 1); // buzz on connection resume or loss
        }
      }
    }

  });

  // clear variables
  settings = undefined;

  // setup bluetooth connection events
  NRF.on('connect', (addr) => WIDGETS.bluetooth_notify.onNRF(addr));
  NRF.on('disconnect', () => setTimeout(()=>{if (!NRF.getSecurityStatus().advertising) WIDGETS.bluetooth_notify.onNRF();}, 250));
  NRF.on('advertising', () => setTimeout(()=>{if (!NRF.getSecurityStatus().connected) WIDGETS.bluetooth_notify.onNRF();}, 250));
}