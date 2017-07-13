var FlipDot = require('../flipdot.js');

var flippy = new FlipDot('/dev/tty.wchusbserial1420',5,7,56);

var matrix = new Array(56).fill(0);

matrix[1] = 0xFF;
var x = flippy.encode(matrix);

flippy.packet.data = x;

flippy.on("error", function(err) {
  console.log(err);
});

flippy.on("open", function() {
  flippy.send(flippy.packet, function() {
    console.log("Sent");
  });
  flippy.close();
});
