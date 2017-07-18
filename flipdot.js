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
      highWaterMark: 32768,
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
  // packet on display
  this.packet = {
    header : [this.hchar, 0x31, 0x35, this.res[0], this.res[1]],
    data : [],
    footer : [this.fchar, 0x00, 0x00],
  };

  // data stream sent to display
  this._buffer = Buffer.alloc(this.packet.header.length + this.ldata + this.packet.footer.length);
  this._queue = [];
  this._busy = false;


  var flipdot = this;

  this.serial = new SerialPort(port, defaults.portSettings, function(err) {
    if (err) {
      this.emit("error", err);
      return;
    }
  });
  
  // Emit when port is open and ready to send data
  this.serial.on('open', function() {
    if (this.debug) console.log('Serial port open @: ' + defaults.portSettings.baudRate);
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
      if (this.debug) console.log('Error: ' + error);
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
  if (this.debug) console.log("Writing serial data, size: " + data.length, "B : " + data.toString('hex'));
  this.serial.write(data);
};

FlipDot.prototype.writeDrain = function(data, callback) {
  if (this.debug) console.log("Writing serial data, size: " + data.length, "B : " + data.toString('hex'));
  this.serial.write(data, 'ascii', function () {
    this.serial.drain(callback);
  }.bind(this));
};

FlipDot.prototype.matrix = function(row = this.rows, col = this.columns) {
  var x = new Array(row).fill(0);
  for (var i = 0; i < row; i++) {
    x[i] = new Array(col).fill(0);
  }

  return x;
}

FlipDot.prototype.matrixToBytes = function(matrix) {
  var x = new Array(matrix[0].length * this.col_bytes).fill(0);

  // TODO: Scale to include flipdots with more than 1 byte per column
  for (j = 0; j < x.length; j++) {
    for (i = 0; i < 8; i++) {
      x[j] += (matrix[i][j] & 0x01) << i;
    }
  }

  return x;
}

FlipDot.prototype.writeText = function(text, font = 'Banner', hLayout = 'default', vLayout = 'default') {
  var aart = figlet.textSync(text, {
    font: font,
    horizontalLayout: hLayout,
    verticalLayout: vLayout
  });

  console.log(aart);

  // convert string to array at line breaks
  aart = aart.split('\n');

  // get a matrix to fill TODO: length of string and que excess data
  mat = this.matrix();
  
  // fill matrix with on/off char/void
  aart.forEach(function(row,i) {
    for (j = 0; j < row.length; j++) {
      mat[i][j] = ( (row.charAt(j) === '') || (row.charAt(j) === ' ') ) ? 0 : 1;
    }
  });

  // convert matrix to column hex array
  data = this.matrixToBytes(mat);

  // encode it for Hanover display
  data = this.encode(data);

  // set data to property for next send
  //this.packet.data = data;

  return data;
}

FlipDot.prototype.byteToAscii = function(byte) {
  var asciichars = new Buffer(2);

  b1 = 0;
  b2 = 0;
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
  var bytes = [];

  // run through matrix, replacing chars with 0 or 1 for on/off
  // TODO: look up string replace in node

  // TODO: Use binstring to parse string based matrix into hex rows/bytes and create byte array

  matrix.forEach(function(byte) {
    data = data.concat(this.byteToAscii(byte));
  }.bind(this));

  if (this.debug) console.log("Encoded Data: " + data);

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
  crc =  (sum ^ 255) + 1;

  return crc;
};

FlipDot.prototype.send = function(data, callback) {

  // check data length and que if longer than display/pad if less
  if (typeof data !== "undefined") {
    // not longer
    if ( data.length > this.ldata ) {
      this.packet.data = data.slice(0,this.ldata)
      for (i = this.ldata; i <= data.length; i += this.ldata) {
        this._queue.push(data.slice(i,i+this.ldata));
      }
    // not shorter either append zeros if is
    } else if ( data.length < this.ldata) {
    // exists and right size, stick it in packet
    } else {
      this.packet.data = data;
    }
  }
  
  // stick data in the packet if passed otherwise use current data
  //if (typeof this._queue !== "undefined") {
    //this.packet.data = this_queue.pop();
  //}
  console.log(this._queue.length);

  // calculate CRC
  var crc = this.__checksum__(this.packet);
  var footer = this.byteToAscii(crc);

  // write footer with CRC to packet
  this.packet.footer[1] = footer[0];
  this.packet.footer[2] = footer[1];

  // make into binary buffers for serialport
  head = Buffer.from(this.packet.header);
  msg = Buffer.from(this.packet.data);
  footer = Buffer.from(this.packet.footer);

  // update object and con concat the packet into one stream
  // this.packet = packet;
  this._buffer = Buffer.concat([head, msg, footer]);

  // write via serial
  this.writeDrain(this._buffer, callback);
};

/**
 * Close the serial port ready to clear object
 * @param {function} callback to call when port closed
 */

FlipDot.prototype.close = function(callback) {
  this.serial.close(callback);
};

module.exports = FlipDot;
