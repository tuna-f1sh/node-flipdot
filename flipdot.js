/*
//  GPL 3.0 License

//  Copyright (c) 2016 John Whittington www.jbrengineering.co.uk

//  This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.

//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http:www.gnu.org/licenses/>.
*/

// Built-in Dependencies
var Emitter = require("events").EventEmitter;
// External Dependancies
var SerialPort = require('serialport');

// Modules
var figlet = require('figlet');
var debug = require('debug')('flipdot')
var asciiDebug = require('debug')('ascii')

function FlipDot(port, addr, rows, columns, callback) {
  if (typeof port === "function" || typeof port === "undefined") {
    callback = port;
  }
  
  // Default values for connection
  var defaults = {
    connectTimeout : 5000,
    portSettings : {
      baudRate : 4800,
      autoOpen : true,
      // highWaterMark: 32768,
    },
  };

  // Need to be multiples of 8
  if (rows % 8)
    rows = rows + (8-(rows % 8));
  
  // Properties
  this.debug = true;
  this.hchar = 0x02;
  this.fchar = 0x03;
  this.addr = addr || 5;
  this.rows = rows || 8;
  this.columns = columns || 56;
  this.data = ((rows * columns) / 8); // frame data size is div 8 because dots sent as bytes (actual data sent will be twice this due to ascii encoding of hex byte...
  this.col_bytes = rows / 8; // number of bytes in each column
  this.ldata = (this.columns * this.col_bytes * 2);
  this.res = this.byteToAscii(this.data & 0xFF); // resolution in Hanover format for header
  this.refresh = 500;
  this.reTask = null;

  // packet on display
  this.packet = {
    header : [this.hchar, 0x31, 0x35, this.res[0], this.res[1]],
    data : [],
    footer : [this.fchar, 0x00, 0x00],
  };

  // initialise the data buffer to text 'null'
  this.writeText('null');

  // data stream sent to display
  this._buffer = Buffer.alloc(this.packet.header.length + this.ldata + this.packet.footer.length);
  this._queue = [];
  this._busy = false;

  this.error_msg = this.writeText('error',undefined,undefined,undefined,false,false);

  // var flipdot = this;

  this.serial = new SerialPort(port, defaults.portSettings, function(err) {
    if (err) {
      this.emit("error", err);
      return;
    }
  });
  
  // Emit when port is open and ready to send data
  this.serial.on('open', function() {
    console.log('FlipDot port open on ' + port + ' @: ' + defaults.portSettings.baudRate);
    this.serial.flush();
    this.emit("open");
  }.bind(this));

  this.serial.on("close", function() {
    this.emit("close");
    console.log("close");
  }.bind(this));

  this.serial.on("disconnect", function() {
    this._busy = false;
    this._queue = [];
    this.emit("disconnect");
    console.log("disconnect");
  }.bind(this));

  this.serial.on("error", function(error) {
    if (typeof callback === "function") {
      callback(error);
    } else {
      debug(error);
      this.emit("error", error);
    }
  }.bind(this));

}

FlipDot.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: FlipDot,
  },
});

FlipDot.prototype.write = function(data) {
  debug("Writing serial data, size: " + data.length, "B : " + data.toString('hex'));
  this.serial.write(data);
};

FlipDot.prototype.writeDrain = function(data, callback) {
  debug("Writing serial data, size: " + data.length, "B : " + data.toString('hex'));
  this.serial.write(data, function () {
    this.serial.drain(callback);
  }.bind(this));
};

FlipDot.prototype.matrix = function(row = this.rows, col = this.columns, fill = 0x00) {
  var x = new Array(row).fill(fill);
  for (var i = 0; i < row; i++) {
    x[i] = new Array(col).fill(fill);
  }

  return x;
}

FlipDot.prototype.matrixToBytes = function(matrix) {
  var x = new Array(matrix[0].length * this.col_bytes).fill(0);

  // walk columns of bytes
  for (var j = 0; j < x.length; j++) {
    // walk bytes in column
    for (var b = 0; b < this.col_bytes; b++) {
      // walk bits in byte constructing hex value
      for (var i = 8*b; i < 8 * (b+1); i++) {
        x[j] += (matrix[i][j] & 0x01) << i;
      }
    }
  }

  return x;
}

FlipDot.prototype.writeMatrix = function(matrix) {
  var data = this.matrixToBytes(matrix)

  return data;
}

FlipDot.prototype.writeFrames = function(frames, refresh = this.refresh) {
  if (frames.length > 0)
    this.load(frames[0]);
    this.refresh = refresh; // set reTask time if passed

    // then queue remaining frames
    for (var i = 1; i < frames.length; i++)
      this.load(frames[i],true);
}

FlipDot.prototype.writeText = function(text, font = 'Banner', hLayout = 'default', vLayout = 'default', invert = false, load = true) {
  var aart = figlet.textSync(text, {
    font: font,
    horizontalLayout: hLayout,
    verticalLayout: vLayout
  });

  asciiDebug(aart);

  // convert string to array at line breaks
  aart = aart.split('\n');

  // get a matrix to fill 
  var mat = this.matrix(this.rows, this.columns, invert);
  
  // fill matrix with on/off char/void
  aart.forEach(function(row,i) {
    for (var j = 0; j < row.length; j++) {
      mat[i][j] = ( (row.charAt(j) === '') || (row.charAt(j) === ' ') ) ? invert : !invert;
    }
  });

  // convert matrix to column hex array
  var data = this.matrixToBytes(mat);

  // set data to property for next send
  if (load) this.load(data);

  return data;
}

FlipDot.prototype.clear = function() {
  this._stopQueue();

  this.fill(0x00);
}

FlipDot.prototype.fill = function(value) {
  var x = new Array(this.columns).fill(value);
  this.send(x);
}

FlipDot.prototype.byteToAscii = function(byte) {
  var asciichars = new Buffer(2);

  var b1 = 0;
  var b2 = 0;
  b1 = byte >> 4;
  if (b1 > 9)
      b1 += 0x37;
  else
      b1 += 0x30;

  b2 = byte % 16;
  if (b2 > 9)
      b2 += 0x37;
  else
      b2 += 0x30;

  asciichars = [b1, b2];

  return asciichars;
};

FlipDot.prototype.encode = function(matrix) {
  var data = [];

  matrix.forEach(function(byte) {
    data = data.concat(this.byteToAscii(byte));
  }.bind(this));

  debug("Encoded Data: " + data);

  return data;
};

FlipDot.prototype.__checksum__ = function(packet) {
  var sum = 0;

  // Sum header
  packet.header.forEach(function(byte) {
    sum += byte;
  });

  // Sum data
  packet.data.forEach(function(byte) {
    sum += byte;
  });

  // Start of text (0x02) must be removed,
  // End of text (0x03) must be added
  sum += 1;

  // Result must be casted to 8 bits
  sum = sum & 0xFF;

  // Checksum is the sum XOR 255 + 1. So, sum of all bytes + checksum
  // is equal to 0 (8 bits)
  var crc =  (sum ^ 255) + 1;

  return crc;
};

FlipDot.prototype._stopQueue = function() {
  // stop the task if it's running
  if (this.reTask !== null) {
    clearInterval(this.reTask);
    this.reTask = null;
    this._busy = false;
  }

  // clear the queued data
  this._queue = [];
}

FlipDot.prototype.load = function(data = 0x00, queue = false) {
  // encode it for Hanover display
  data = this.encode(data);

  // prepare next frame to show variable
  var next = this.packet.data;

  // check data length and que if longer than display/pad if less
  if ( data.length > this.ldata ) {
    next = data.slice(0,this.ldata)
    for (var i = (2 * this.col_bytes); i <= (data.length-this.ldata); i+=(2 * this.col_bytes)) {
      this._queue.push(data.slice(i,this.ldata+i));
    }
  // not shorter either append zeros if is
  } else if ( data.length < this.ldata) {
    next = data.concat(new Array(this.ldata - data.length).fill(0));
  // exists and right size, stick it in packet
  } else {
    next = data;
  }

  // queue the data if requested, otherwise load it for next send
  if (queue) this._queue.push(next); else this.packet.data = next;

}

FlipDot.prototype.send = function(data, callback) {

  // load some data if it has been passed
  if (typeof data !== "undefined" && typeof data !== "function") {
    this.load(data,false);
  } else if (typeof data === "function" ) {
    callback = data;
  }

  // assert the data is in packet before sending
  if (typeof this.packet.data === 'undefined' || this.packet.data.length < this.ldata) {
    this.load(this.error_msg);
  }
  
  // calculate CRC
  var crc = this.__checksum__(this.packet);
  var footer = this.byteToAscii(crc);

  // write footer with CRC to packet
  this.packet.footer[1] = footer[0];
  this.packet.footer[2] = footer[1];

  // make into binary buffers for serialport
  var head = Buffer.from(this.packet.header);
  var msg = Buffer.from(this.packet.data);
  var footer = Buffer.from(this.packet.footer);

  // update object and con concat the packet into one stream
  // this.packet = packet;
  this._buffer = Buffer.concat([head, msg, footer]);

  // write via serial
  var temp = Buffer.alloc(this.packet.header.length + this.ldata + this.packet.footer.length).fill(0x00);
  this._buffer.copy(temp); // copy to avoid changes during write
  // this.write(temp);
  this.writeDrain(this._buffer, function () {
  
    // send complete, pop next data from queue and start task if queue exists
    if (this._queue.length > 0) {
      this.packet.data = this._queue.shift();
      if (this.reTask === null) {
        this._busy = true;
        this.reTask = setInterval( function() {
          if (this._queue.length > 0) {
            this.send()
          } else {
            clearInterval(this.reTask);
            this.reTask = null;
            this._busy = false;
          }
        }.bind(this), this.refresh);
      }
    } else {
      this.emit("free");
    }

    this.emit("sent");

    // run passed callback
    if (typeof callback !== "undefined") {
      callback();
    }

  }.bind(this));
};

/**
 * Close the serial port ready to clear object
 * @param {function} callback to call when port closed
 */

FlipDot.prototype.close = function(callback) {
  this.serial.close(callback);
};

module.exports = FlipDot;