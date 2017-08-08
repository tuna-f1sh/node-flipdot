var FlipDot = require('../flipdot.js');

/* MOCK BINDING FOR TEST 
 * comment out and uncomment physical port below to use with device 
 */
const SerialPort = require('serialport/test');
const MockBinding = SerialPort.Binding;

MockBinding.createPort('/dev/ROBOT', { echo: true });
var flippy = new FlipDot('/dev/ROBOT',5,7,56);

// var flippy = new FlipDot('/dev/tty.wchusbserial1420',5,7,56);

var lines = [
  'Lots',
  'of.....',
  'ascii',
  'fonts!',
  '1337 :D',
];

var fonts = [
  'Colossal',
  'Banner3',
  '3x5',
  'Block',
  'Banner',
];

var invert = [
  false,
  true,
  false,
  true,
  false,
];

var i = -1;

flippy.on("error", function(err) {
  console.log(err);
});

flippy.once("open", function() {
  flippy.fill(0xFF);
  
  flippy.writeParagraph('Hanover\nFlipDot\nDisplay\nRS485\nDriver\nWith\nScrolling.')

  flippy.once('free', function () {
    var interval = setInterval( function () {
      if (++i < lines.length) {
        flippy.writeText(lines[i], { font: fonts[i] },undefined, invert[i])
        flippy.send();
      } else {
        clearInterval(interval);
        flippy.writeText('JBR Engineering 2017', { font: '3x5', horizontalLayout: 'squash'} )
        flippy.refresh = 600;
        flippy.send();
      }
    }, 1000);
  });
});
