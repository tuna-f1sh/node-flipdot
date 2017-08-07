var FlipDot = require('../flipdot.js');

// const SerialPort = require('serialport/test');
// const MockBinding = SerialPort.Binding;

// MockBinding.createPort('/dev/ROBOT', { echo: true });
var flippy = new FlipDot('/dev/tty.wchusbserial1420',5,7,56);

frames = [
  "I think",
  "they got",
  "the front",
  "and rear",
  "mixed up!!!!!!!!"
];

flippy.on("error", function(err) {
  console.log(err);
});

flippy.once("open", function() {
  flippy.fill(0xFF);
  
  var x = -1;
  var task = setInterval( function() {
    if (++x < frames.length) {
      flippy.writeText(frames[x]);
      flippy.send();
    } else {
      clearInterval(task);
    }
  }, 1000);
});
