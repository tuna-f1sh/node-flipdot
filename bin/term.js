var FlipDot = require('../flipdot.js')
var args = require('args')

args
  .option('port', 'The serial device to attach FlipDot', '/dev/ttyUSB0')
  .option('rows', 'Number of rows on display', 7)
  .option('columns', 'Number of columns on display', 56)
  .option('address', 'Address of display (sent in header)', 5)
  .option('string', 'The string to write', 'Hello World!!')
  .option('font', 'Figet font to use', 'Banner')
  .option('invert', 'Invert display', false)
//   .command('write', 'Serve your static site', ['s'])

const flags = args.parse(process.argv)

var flippy = new FlipDot(flags.port,flags.address,flags.rows,flags.columns);

flippy.on("error", function(err) {
  console.log(err);
});

flippy.once("open", function() {
  flippy.fill(0xFF);
  flippy.writeText(flags.string, flags.font, undefined, undefined, flags.invert)
  console.log('Sending: ' + flags.string)
  flippy.send(() => {
    console.log("Writing...")
  })
});

flippy.once('free', () => {
    console.log("Written!")
    flippy.close();
    process.exit(0);
})