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
          if (timeout !== undefined) clearTimeout(timeout);
          timeout = setTimeout(()=>{
            ci.items[0].emit("redraw");
            if (interval !== undefined) clearInterval(interval);
            interval = setInterval(()=>{
              ci.items[0].emit("redraw");
            }, 6e4);
          }, 6e4 - (Date.now() % 6e4));
        },
        hide: ()=>{
          if (timeout !== undefined) {
            clearTimeout(timeout);
            timeout = undefined;
          }
          if (interval !== undefined) {
            clearInterval(interval);
            interval = undefined;
          }
        }
      }
    ]
  };
  return ci;
})