{
  let backlightKeepState = function(func, a, b) {
    let backlightWasOn = Bangle.isBacklightOn();
    Bangle.setLCDBrightness(0);
    let output = func(a, b);
    Bangle.setBacklight(backlightWasOn);
    Bangle.setLCDBrightness(require("Storage").readJSON("setting.json").brightness
    );
    return output;
  };
  let _showPrompt = E.showPrompt;
  E.showPrompt = backlightKeepState.bind(this, _showPrompt);
}