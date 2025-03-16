{
  if (typeof __FILE__ === "undefined")
    __FILE__ = undefined;
  let _lastApp = __FILE__;
  let _loadWidgets = Bangle.loadWidgets;
  Bangle.loadWidgets = ()=>{
    if (_lastApp != __FILE__) {
      Bangle.emit("appChanged", __FILE__);
      _lastApp = __FILE__;
    }
    return _loadWidgets();
  };
  setTimeout(()=>(
    Bangle.emit("appChanged", __FILE__)
  ), 250);
}