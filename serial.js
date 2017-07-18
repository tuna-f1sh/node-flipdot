var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 4800
});

port.write(new Buffer(256), function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});
