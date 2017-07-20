var FlipDot = require('../flipdot.js');

var flippy = new FlipDot('/dev/tty.wchusbserial1420',5,7,56);

// var matrix = new Array(56).fill(0xff);

// matrix[1] = 0xFF;
// data = flippy.encode(matrix);
//var x = flippy.writeText('Hello World!', '3x5');

var i = -1;

frames = [
  "Hello",
  "Henry",
  "Bacon",
  // "Frame",
];

flippy.on("error", function(err) {
  console.log(err);
});

flippy.once("open", function() {
  flippy.fill(0xFF);
  // flippy.send(data);
  // text = flippy.writeText("Hi Henry");
  // flippy.send(text)
  
  x = -1;
  task = setInterval( function() {
    if (++x < frames.length) {
      frame = flippy.writeText(frames[x],undefined,undefined,undefined,1);
      flippy.send(() => {console.log('written');});
    } else {
      clearInterval(task);
    }
  }, 1000);
});
