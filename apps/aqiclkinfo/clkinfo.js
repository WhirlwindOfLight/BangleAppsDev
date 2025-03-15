(function() {
  let timeout;
  let interval;
  let ci = {
    name: "Bangle",
    items: [
      {
        name: "AQI",
        get: ()=>({text: "AQI:\n"+
            require("Storage").read("Ogden_AQI.txt")
        }),
        show: ()=>{
          timeout = setTimeout(()=>{
            ci.items[0].emit("redraw");
            interval = setInterval(()=>{
              ci.items[0].emit("redraw");
            }, 6e4);
          }, 6e4 - (Date.now() % 6e4));
        },
        hide: ()=>{
          clearTimeout(timeout);
          timeout = undefined;
          clearInterval(interval);
          interval = undefined;
        }
      }
    ]
  };
  return ci;
})