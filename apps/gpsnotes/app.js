{
  Bangle.loadWidgets();
  g.clear(1);
  Bangle.drawWidgets();

  // Allow taskerIntent to work even if it doesn't exist
  let taskerIntent = Bangle.taskerIntent||((name,data)=>(print(JSON.stringify({intent:name,data:data}))));
  let myIntent = taskerIntent.bind(this, "gpsnote");

  // Define the layout
  let txt = (id, label, font)=>({
    type:"txt",
    font:font,
    label:label,
    id:id
  });
  let layoutData = ()=>([
    txt("currentTimeLabel","Current Time:","6x8:2"),
    txt("currentTime"," XX:XX AM ","12x20:2"),
    txt("lastNoteTimeLabel","Last Note:","6x8:2"),
    txt("lastNoteTime"," XX:XX AM ","12x20:2")
  ]);
  let baseLayout = new (require("Layout"))({
    type:"v", c: layoutData()
  });
  let myLayout = new (require("Layout"))({
    type:"v", c: layoutData()
  }, {lazy:true});

  // Helper functions
  let formatTime = function(timeObj) {
    let hour = timeObj.getHours();
    let min = timeObj.getMinutes();
    let merid;
    if (hour < 12) {
      merid = "AM";
    } else {
      hour -= 12;
      merid = "PM";
    }
    if (hour == 0) hour = 12;
    hour = String(hour).padStart(2,"0");
    min = String(min).padStart(2,"0");
    return hour+":"+min+" "+merid;
  };
  let setField = (field,fmtStr,val)=>(
    myLayout[field].label =
      baseLayout[field].label.replace(fmtStr,val)
  );
  let setTime = (field,val)=>(
    setField(field, "XX:XX AM", val)
  );
  let updateTime = (field)=>(
    setTime(field, formatTime(new Date()))
  );

  // Main draw logic
  let update = ()=>{
    updateTime("currentTime");
    myLayout.render();
  };
  let record = ()=>{
    myIntent();
    updateTime("lastNoteTime");
    myLayout.render();
    Bangle.buzz();
  };
  let timeout;
  let updateTimeout = ()=>{
    update();
    let timeToNext = 60e3 - ((new Date()).ms % 60e3);
    timeout = setTimeout(updateTimeout, timeToNext);
  };
  updateTimeout();
  Bangle.setUI({
    mode: "custom",
    btn: record,
    remove: ()=>(clearTimeout(timeout))
  });
}