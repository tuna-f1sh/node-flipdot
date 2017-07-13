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
  this.res = this.byteToAscii(this.data & 0xFF);
  this.packet = {
    header : [this.hchar, 0x31, 0x35, this.res[0], this.res[1]],
    data : [],
    footer : [this.fchar, 0x00, 0x00],
  };
  this.buffer = Buffer.alloc(5 + (this.columns * this.col_bytes * 2) + 3);

  // console.log(this.packet);

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

}

FlipDot.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: FlipDot,
  },
});

FlipDot.prototype.write = function(data) {
  if (this.debug) console.log("Writing serial data, size: " + data.length, " : " + data.toString('hex'));
  this.serial.write(data);
};

FlipDot.prototype.writeDrain = function(data, callback) {
  if (this.debug) console.log("Writing serial data, size: " + data.length, "b : " + data.toString('hex'));
  this.serial.write(data, 'ascii', function () {
    this.serial.drain(callback);
  }.bind(this));
};

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
  var flipdot = this;

  matrix.forEach(function(byte, i) {
    data = data.concat(this.byteToAscii(byte));
  }.bind(this));

  // if (this.debug) console.log(data);

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

FlipDot.prototype.send = function(packet, callback) {
  var crc = this.__checksum__(packet);
  var footer = this.byteToAscii(crc);

  packet.footer[1] = footer[0];
  packet.footer[2] = footer[1];

  head = Buffer.from(packet.header);
  msg = Buffer.from(packet.data);
  footer = Buffer.from(packet.footer);

  this.buffer = Buffer.concat([head, msg, footer]);

  console.log(this.buffer);
  console.log(packet.header);
  console.log(packet.footer);
  console.log(this.buffer.length);

  this.packet = packet;

  this.writeDrain(this.buffer, callback);
};

/**
 * Close the serial port ready to clear object
 * @param {function} callback to call when port closed
 */

FlipDot.prototype.close = function(callback) {
  this.serial.close(callback);
};

module.exports = FlipDot;
