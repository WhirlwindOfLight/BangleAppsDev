{
  Bangle.loadWidgets();
  g.clear(1);
  Bangle.drawWidgets();

  // Allow taskerIntent to work even if it doesn't exist
  let taskerIntent = Bangle.taskerIntent||(name,data)=>(print(JSON.stringify({intent:name,data:data})));
  let myIntent = taskerIntent.bind(this, "statmachstpwtch");

  // Define the layout
  let txt = (id, label, font)=>({
    type:"txt",
    font:font,
    label:label,
    id:id
  });
  let layoutData = ()=>([
    txt("currentTime"," XX:XX AM ","6x8:2"),
    txt("counterTotalTime"," XX:XX:XX ","12x20:2"),
    {type:"h", c: [
      txt("counterLapNum"," L:XX","6x8:2"),
      {width:16},
      txt("counterStateNum","S:X ","6x8:2"),
    ]},
    txt("counterStateTime"," XXX secs ","12x20:2"),
    txt("counterStateTarget"," out of XXX ","6x8:2")
  ]);
  let baseLayout = new (require("Layout"))({
    type:"v", c: layoutData()
  });
  let myLayout = new (require("Layout"))({
    type:"v", c: layoutData()
  }, {lazy:true});

  // Global Variables
  let stateMachine = [120, 180];
  let currentState;
  let currentLap=0;
  let timerMax;
  let timerStart;
  let stateDelta = 0;

  // Helper Functions
  let stateLetter = (offset)=>(String.fromCharCode("A".charCodeAt(0)+offset));
  let setField = (field,fmtStr,val)=>(
    myLayout[field].label =
      baseLayout[field].label.replace(fmtStr,val)
  );

  let stateChange = function(newState){
    currentState = newState;
    timerMax = stateMachine[currentState];
    if (currentState==0) currentLap++;
    setField("counterStateTarget","XXX",
            String(timerMax).padStart(3," "));
    setField("counterStateNum","X",
            stateLetter(currentState));
    setField("counterLapNum","XX",
            String(currentLap).padStart(2,"0"));
  };
  let loadNextState = function() {
    stateChange((currentState+1) % stateMachine.length);
    require("buzz").pattern(
      (currentState!=0) ? ":; :;" : "::=");
    myIntent({
      event: "newState",
      stateStart: timerStart + stateDelta*1000,
      stateVal: stateLetter(currentState),
      stateSecsMax: timerMax,
      lap: String(currentLap).padStart(2,"0")
    });
  };

  let formatDelta = function(deltaSecs) {
    let delta = deltaSecs;
    let secs = String(Math.floor(delta) % 60);
    delta /= 60;
    let mins = String(Math.floor(delta) % 60);
    delta /= 60;
    let hours = String(Math.floor(delta) % 60);
    return hours.padStart(2, "0") +
      ":"+mins.padStart(2, "0") +
      ":"+secs.padStart(2, "0");
  };

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

  // Main draw logic
  let draw = function(){
    let timerDelta = (new Date()) - timerStart;
    let timerSecs = Math.round(timerDelta/1000);
    let stateSecs = timerSecs - stateDelta;
    if (stateSecs >= timerMax) {
      stateDelta += timerMax;
      loadNextState();
      stateSecs = timerSecs - stateDelta;
    }
    // Update the layout
    setField("currentTime","XX:XX AM",
            formatTime(new Date()));
    setField("counterTotalTime","XX:XX:XX",
            formatDelta(timerSecs));
    setField("counterStateTime","XXX",
            String(stateSecs).padStart(3," "));
    myLayout.render();
  };

  let started = false;
  let interval;
  let start = function(){
    if (started) return;
    started = true;
    timerStart = Date.now();
    stateChange(0);
    draw();
    interval=setInterval(draw,1e3);
    myIntent({
      event: "start",
      timerStart: Math.round(timerStart),
      stateStart: timerStart + stateDelta*1000,
      stateVal: stateLetter(currentState),
      stateSecsMax: timerMax,
      lap: String(currentLap).padStart(2,"0")
    });
  };
  Bangle.setUI({
    mode: "custom",
    btn: ()=>(start()),
    remove: ()=>(clearInterval(interval),myIntent({event:"clear"}))
  });
  myLayout.render();
}