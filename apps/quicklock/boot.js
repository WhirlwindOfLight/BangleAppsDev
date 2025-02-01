{
  Bangle.on("swipe", (lr,ud) => {
    if (!Bangle.SWIPE_LOCK||
      !Bangle.CLOCK||
      Bangle.CLKINFO_FOCUS) return;
    /* lr is positive on swipe [left->right] */
    if (lr == 1) Bangle.setBacklight(false);
  });
}