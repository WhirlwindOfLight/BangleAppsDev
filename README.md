# BangleAppsDev
This is a repository for my WIP apps for BangleJS. This repository contains a variety of tweaked versions of others' apps, apps that aren't done, and apps I simply haven't submitted to the official app store, but all code is intended to be compatible with the official apps repository, and as such, is [MIT licensed](LICENSE) by me, unless it is a fork from the official apps repository, in which case, it is *also* subject to *that* license. See the [offical BangleJS Apps repository](https://github.com/espruino/BangleApps) for more details.

## Usage
The easiest way to run the apps is to rename and load an app's `app.js` file and/or `boot.js` file into an emulator in the [official Web IDE](https://www.espruino.com/ide/). If you have a physical BangleJS 2 watch, you can also try to host a copy of the official appstore with the `apps` directory replaced with the `apps` directory in this repository, although tinkering may be required as the process to do that has not yet been documented.

## Apps Listed
### Mostly Original
These apps were mostly designed from scratch, but may still copy design patterns and/or snippets from official BangleJS apps:
* 3dcompass
    * A compass app that displays the 3D angle to North instead of giving a simple heading. Also allows you to get the angle between Down and North.
* appchangedevents
    * A boot code tweak to make changing apps emit events, so fastloading can be more efficient.
* aqiclkinfo
    * A Clockinfo that displays the AQI as logged in a text file. Currently doesn't have a way to request the AQI, so the text file needs to be written manually.
* gpsnotes
    * A simple app with a button to send intents to tell an Android phone running Tasker to log the GPS location. Currently GPS-logging logic is not implemented in the app itself, but it may be added in the future.
* magcal
    * An app to try to help calibrate the magnetometer without doing motions that would be hard to do while wearing the watch.
* noautolight
    * A boot code tweak to prevent the backlight from turning on when `E.showPrompt()` is called. Designed as an attempt to limit battery drain from alarms and timers forcing the backlight on.
* quicklock
    * A boot code tweak to allow swiping to the "lock" the screen (turn off the backlight and touch sensor) when on the clockface.
* statmachstpwtch
    * A stopwatch app that toggles between two states that have different amounts of time. This app was designed to make a Physics lab easier where I had to toggle between doing something for 2 minutes and 3 minutes while also keeping track of the total time.
* time_heartbeat
    * A boot code tweak to make the watch buzz once every 1 or 5 seconds. Useful to make it easier to tell if the watch has crashed.
### Derived Work Forks
These apps started from official BangleJS apps but had their behavior heavily modified to do something else:
* maggraph
    * Derived from [accelgraph](https://github.com/espruino/BangleApps/tree/master/apps/accelgraph), but modified to measure magnetometer data instead of accelerometer data
* q_android
    * Derived from the settings page for [the Android app](https://github.com/espruino/BangleApps/tree/master/apps/android), but shortened and tweaked to include only settings I would want in a quicklaunch menu
* tagoverrides
    * Derived from [Custom Boot Code](https://github.com/espruino/BangleApps/tree/master/apps/custom), but modified to help with adding a JSON file to define custom tags for apps (for use in my tweaked version of taglaunch) instead of adding boot code.
### Tweak Forks
These apps are mostly the same as their original version, but with minor tweaks to patch bugs, add features, or to integrate better with my other apps:
* accelgraph
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/accelgraph)
* autoreset
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/autoreset)
* fastload
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/fastload)
* lcdclockplus
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/lcdclockplus)
* mixdiganclock
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/migdiganclock)
* powermanager
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/powermanager)
* quicklaunch
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/quicklaunch)
* swp2clk
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/swp2clk)
* taglaunch
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/taglaunch)
* widbatpc
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/widbatpc)
* widbt_notify
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/widbt_notify)
* widmessages
    * [(Original Version)](https://github.com/espruino/BangleApps/tree/master/apps/widmessages)

## Note on Icons
None of the icons chosen for the apps were designed by my me, and instead they were all chosen based on apps in the offical BangleJS apps repository. For any app that is a fork, I most likely kept the original icon, and for all other apps, I chose an icon based on other official apps that did a similar thing. This was done to speed up development, because technically, an app should not exist in the app loader on the watch or in the app store without an icon. Also, as stated in the official repository, the majority of icons are *actually* from [Icons8](https://icons8.com/) anyways, and should be free for use in Open Source projects.













