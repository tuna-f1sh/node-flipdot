var FlipDot = require('../flipdot.js');
var dateFormat = require('dateformat');

var flippy = new FlipDot('/dev/tty.wchusbserial1420',5,7,56);

function startClock(seconds = false) {
  var format = "   HH:MM"
  if (seconds) {
    format = format.concat(":ss")
    format = format.trim()
  }
  
  var lastString = [];
  var task = setInterval( function() {
    var now = new Date();
    var timeString = dateFormat(now,format);
    if (timeString != lastString) {
      flippy.writeText(dateFormat(now, timeString))
      flippy.send();
      lastString = timeString;
    }
  }, 1000);
  
  return task;
}

function stopClock(task) {
  clearInterval(task);
}

flippy.on("error", function(err) {
  console.log(err);
});

flippy.once("open", function() {
  flippy.fill(0xFF);
  
  startClock(false);
});
