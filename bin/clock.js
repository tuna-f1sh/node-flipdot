var FlipDot = require('../flipdot.js');
var dateFormat = require('dateformat');
var args = require('args')

args
  .option('port', 'The serial device to attach FlipDot', '/dev/ttyUSB0')
  .option('rows', 'Number of rows on display', 7)
  .option('columns', 'Number of columns on display', 56)
  .option('address', 'Address of display (sent in header)', 5)
  .option('xaxis', 'x offset', 0)
  .option('yaxis', 'y offset', 0)
  .option('font', 'Figet font to use', 'Banner')
  .option('invert', 'Invert display', false)
  .option('seconds', 'Display seconds', false)

const flags = args.parse(process.argv)

var flippy = new FlipDot(flags.port,flags.address,flags.rows,flags.columns);

function startClock(seconds = false, font = 'Banner', offset = [0,0], invert = false) {
  var format = "HH:MM"
  if (seconds) {
    format = format.concat(":ss")
  }
  
  var lastString = [];
  var task = setInterval( function() {
    var now = new Date();
    var timeString = dateFormat(now,format);
    if (timeString != lastString) {
      flippy.writeText(timeString, {font: font}, offset, invert);
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
  
  startClock(flags.seconds, flags.font, [flags.xaxis, flags.yaxis], flags.invert);
});
