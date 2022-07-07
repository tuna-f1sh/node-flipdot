# Hanover FlipDot Display RS485 Driver

![Demo gifv](http://i.imgur.com/wRxU6VV.gif)

Node.js driver for the [Hanover Flip-Dot Display](http://dbiw.net/HanoverDisplays/Flip_Dot_Manual_vB.pdf). Designed to be used with [USB-RS485 dongle](https://www.ebay.co.uk/sch/i.html?_from=R40&_trksid=p5197.m570.l1313&_nkw=usb+rs485&_sacat=See-All-Categories).

For a usage demo, see the [emulated web app
controller](http://flipdot.jbrengineering.co.uk) I made for my
display to show at a local art trail. [Source
link](https://github.com/tuna-f1sh/flippy-flipdot-web).

See my blog post and YouTube video for a technical run down: [https://engineer.john-whittington.co.uk/2017/11/adventures-flippy-flip-dot-display/](https://engineer.john-whittington.co.uk/2017/11/adventures-flippy-flip-dot-display/)

## Features

* Figlet ascii art based text renderer, including font selection, offset and
  inversion.
* Automatic scrolling text.
* Automatic queueing of data and frame management.
* Matrix based data input (\[x\]\[y\]).

## Installation & Usage

As a module:
```
npm install flipdot-display # see below sections on integration
```

As a CLI application:
```
npm install -g flipdot-display
flipdot --help # send text bin (args are optional)
flipdot-clock --help # send clock bin (args are optional)
```

### Debug

`DEBUG=* node examples/test.js`

### Important Notes

* The **address** of your display (defualt 0x05 - arbitary but matches mine) must be correct otherise the display will not display the data. Find the correct address through trial and error or by taking the back off and reading the potentiometer (RHS) position
* The **number of columns and rows** (default 56x7) must be correct for your display otherwise the message length will be incorrect - the Hanover display may not acknowledge or display the incorrect message length.

## Methodology

The Hanover Flip-Dot display expects ascii chars representing the hexadecimal
bytes; bytes being every 8 rows of dots. For example, an eight row column:

```
. = 1 => 0xF5 => ['F', '5'] => [0x46, 0x35]
| = 0
. = 1
| = 0
. = 1
. = 1
. = 1
. = 1
```

Along with a header (containing display resolution and address) and footer
(containing CRC).

My module is designed around a 2d array (or matrix) of rows and columns. One
can create this using `FlipDot.matrix`. The matrix is then converted to an
array of column bytes using `FlipDot.matrixToBytes`. This byte array can
then be buffered for the next send (or queued if multiple frames are desired)
using `FlipDot.load`. Finally, the buffered data is encoded, packaged and
sent using `FlipDot.send`. 

This process is largely automated in `FlipDot.writeText`,
`FlipDot.writeFrames`, `FlipDot.writeParagraph` and `FlipDot.writeMatrix`,
with only a call to `FlipDot.send` required.

See the 'examples/' folder for code usage but broadly:

```javascript
const FlipDot = require('flipdot-display');

const flippy = new FlipDot('/dev/ttyUSB0',5,7,56);

flippy.once('open', function() {
  flippy.writeText('Hello World');
  flippy.send();
});
```

## Acknowledgements

* [ks156 Python driver](https://github.com/ks156/Hanover_Flipdot) - Explained
  the _bizare_ protocol expected by the Hanover display and saved a lot of
  work!
* [@j_whittington](https://twitter.com/j_whittington) - [JBR
  Engineering](https://jbrengineering.com) - 2017
* [![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0)

# JSDoc Class

## FlipDot ⇐ <code>EventEmitter.</code>
FlipDot is a Hanover FlipDot display connected via USB RS485

**Kind**: global class  
**Extends**: <code>EventEmitter.</code>  
**Emits**: <code>FlipDot#event:sent All data sent</code>, <code>FlipDot#event:free Queue&#x27;d data emptied</code>  

* [FlipDot](#FlipDot) ⇐ <code>EventEmitter.</code>
    * [new FlipDot(port, addr, rows, columns, callback)](#new_FlipDot_new)
    * [.write(data)](#FlipDot+write)
    * [.writeDrain(data)](#FlipDot+writeDrain)
    * [.matrix(rows, col, fill)](#FlipDot+matrix) ⇒ <code>matrix</code>
    * [.matrixToBytes(matrix)](#FlipDot+matrixToBytes) ⇒ <code>array</code>
    * [.writeMatrix(matrix, load)](#FlipDot+writeMatrix) ⇒ <code>array</code>
    * [.writeFrames(frames, refresh)](#FlipDot+writeFrames)
    * [.writeText(text, fontOpt, offset, invert, load)](#FlipDot+writeText) ⇒ <code>array</code>
    * [.writeParagraph(paragraph, fontOpt, offset, invert, refresh)](#FlipDot+writeParagraph)
    * [.clear()](#FlipDot+clear)
    * [.fill(value)](#FlipDot+fill)
    * [.asciiToByte(chars)](#FlipDot+asciiToByte) ⇒ <code>int</code>
    * [.byteToAscii(byte)](#FlipDot+byteToAscii) ⇒ <code>array</code>
    * [.encode(matrix)](#FlipDot+encode) ⇒ <code>array</code>
    * [.decode(data)](#FlipDot+decode) ⇒ <code>array</code>
    * [.load(data, queue)](#FlipDot+load)
    * [.send(data, callback)](#FlipDot+send)
    * [.close(callback)](#FlipDot+close)

<a name="new_FlipDot_new"></a>

### new FlipDot(port, addr, rows, columns, callback)

| Param | Type | Description |
| --- | --- | --- |
| port | <code>string</code> | Serial port of RS485. |
| addr | <code>int</code> | Address of FlipDot display, set with pot internal to display. |
| rows | <code>int</code> | Number of rows on display. |
| columns | <code>int</code> | Number of columns on display. |
| callback | <code>function</code> | Function to call when port is open. |

<a name="FlipDot+write"></a>

### flipDot.write(data)
Write data to the serial object.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>buffer</code> | Binary data. |

<a name="FlipDot+writeDrain"></a>

### flipDot.writeDrain(data)
Write to serial object and wait to drain.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>buffer</code> | Binary data. |

<a name="FlipDot+matrix"></a>

### flipDot.matrix(rows, col, fill) ⇒ <code>matrix</code>
Return matrix (2d array), default size of display (matrix[rows][columns])

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>matrix</code> - 2d array [rows][col].  

| Param | Type | Description |
| --- | --- | --- |
| rows | <code>int</code> | Number of rows (default size of display). |
| col | <code>int</code> | Number of columns (default size of display). |
| fill | <code>int</code> | Value to initialise array. |

<a name="FlipDot+matrixToBytes"></a>

### flipDot.matrixToBytes(matrix) ⇒ <code>array</code>
Convert matrix to array of bytes, bytes constructed from rows in each column.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Array of column bytes.  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>matrix</code> | 2d array returned from `this.matrix`. |

<a name="FlipDot+writeMatrix"></a>

### flipDot.writeMatrix(matrix, load) ⇒ <code>array</code>
Load matrix, ready to send on next call.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Array of column bytes.  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>matrix</code> | 2d array returned from `this.matrix`. |
| load | <code>bool</code> | Whether to load the data or just return encoded. |

<a name="FlipDot+writeFrames"></a>

### flipDot.writeFrames(frames, refresh)
Queue data frames to display in order.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| frames | <code>array</code> | Array of display data in byte format. |
| refresh | <code>int</code> | Refresh rate of frames (ms). |

<a name="FlipDot+writeText"></a>

### flipDot.writeText(text, fontOpt, offset, invert, load) ⇒ <code>array</code>
Write text string to display in ascii art format, using _figlet_ module.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Array of column bytes.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to display. |
| fontOpt | <code>object</code> | figlet options { font: , horizontalLayout: , verticalLayout: }. |
| offset | <code>array</code> | Text offset cordinates [x,y]. |
| invert | <code>bool</code> | Invert text. |
| load | <code>bool</code> | Whether to load for next send or just return encoded data. |

<a name="FlipDot+writeParagraph"></a>

### flipDot.writeParagraph(paragraph, fontOpt, offset, invert, refresh)
Write lines of text to display in ascii art format, using _figlet_ module. Same inputs as `writeText` but sends each line as a frame.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| paragraph | <code>string</code> | Lines of text to display; '\n' line break. |
| fontOpt | <code>object</code> | figlet options { font: , horizontalLayout: , verticalLayout: }. |
| offset | <code>array</code> | Text offset cordinates [x,y]. |
| invert | <code>bool</code> | Invert text. |
| refresh | <code>int</code> | Period to display each frame. |

<a name="FlipDot+clear"></a>

### flipDot.clear()
Clear display (write 0x00 and stop queue).

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
<a name="FlipDot+fill"></a>

### flipDot.fill(value)
Fill display with value.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>int</code> | hex value to fill. |

<a name="FlipDot+asciiToByte"></a>

### flipDot.asciiToByte(chars) ⇒ <code>int</code>
Convert Hanover two ascii charactor format hex value to byte.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>int</code> - Byte.  

| Param | Type | Description |
| --- | --- | --- |
| chars | <code>array</code> | Chars representing hex value, eg: ['0','F']. |

<a name="FlipDot+byteToAscii"></a>

### flipDot.byteToAscii(byte) ⇒ <code>array</code>
Convert byte to two ascii chars representing hex value.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Two ascii chars of hex value.  

| Param | Type | Description |
| --- | --- | --- |
| byte | <code>int</code> | Byte to convert. |

<a name="FlipDot+encode"></a>

### flipDot.encode(matrix) ⇒ <code>array</code>
Encode data for Hanover display; the display reads two ascii chars per byte, representing the visual hex representation of the byte - this means the data packet doubles in size.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Hanover encoded data (two ascii chars representing visual form of each byte).  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>array</code> | Array of column bytes. |

**Example**  
```js
// returns ['0', '5']
FlipDot.encode(0x05);
```
<a name="FlipDot+decode"></a>

### flipDot.decode(data) ⇒ <code>array</code>
Decode Hanover display data (two ascii chars per byte) back to bytes.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Bytes (will be half size of passed).  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> | Hanover display data of ascii chars representing visual form of hex byte. |

**Example**  
```js
// returns 0x0F
FlipDot.asciiToBye(['0', 'F']);
```
<a name="FlipDot+load"></a>

### flipDot.load(data, queue)
Load or queue data for next call to `send`. Does the encoding of data.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> | Array of column bytes. |
| queue | <code>bool</code> | Whether to queue or write data. |

<a name="FlipDot+send"></a>

### flipDot.send(data, callback)
Send data to display over RS485 and load next from queue if available. This should be called without parameters after a `write` or `load` function. Will start task to empty queue if queued data, which will pop frames at `this.refresh` period.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>data</code> | Optional: data to send. |
| callback | <code>function</code> | Function to call once data is sent and drained. |

**Example**  
```js
FlipDot.writeText('Hello World');
FlipDot.send();
```
<a name="FlipDot+close"></a>

### flipDot.close(callback)
Close the serial port ready to clear object

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | to call when port closed |

