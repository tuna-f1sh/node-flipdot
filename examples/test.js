var FlipDot = require('../flipdot.js');

var flippy = new FlipDot('/dev/ttyUSB0',5,7,56);

var matrix = new Array(56).fill(0xff);

matrix[1] = 0xFF;
data = flippy.encode(matrix);
flippy.send(data);
//var x = flippy.writeText('Hello World!', '3x5');

var i = 0;

frames = [
  "Hello",
  "World!!",
];

flippy.on("error", function(err) {
  console.log(err);
});

flippy.on("open", function() {
  cycle = setInterval( function() {
    text = flippy.writeText(frames[i]);
    flippy.send(text, function() {
      console.log("Sent");
      (i < (frames.length - 1)) ? i++ : clearInterval(cycle);
    });
  }, 1000);
  //flippy.close();
});
