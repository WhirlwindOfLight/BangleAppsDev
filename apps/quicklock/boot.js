{
  let swipeHandler = (lr,ud) => {
    if (!Bangle.SWIPE_LOCK||
      Bangle.CLKINFO_FOCUS) return;
    /* lr is positive on swipe [left->right] */
    if (lr == 1) Bangle.setBacklight(false);
  };
  Bangle.on("appChanged", (loadedApp)=>{
    Bangle.removeListener('swipe', swipeHandler);;
    if (Bangle.CLOCK) Bangle.on("swipe", swipeHandler);
  });
}