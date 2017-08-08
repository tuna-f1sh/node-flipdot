<a name="FlipDot"></a>

## FlipDot ⇐ <code>EventEmitter.</code>
FlipDot is a Hanover FlipDot display connected via USB RS485

**Kind**: global class  
**Extends**: <code>EventEmitter.</code>  

* [FlipDot](#FlipDot) ⇐ <code>EventEmitter.</code>
    * [new FlipDot(port, addr, rows, columns, callback)](#new_FlipDot_new)
    * [.write(data)](#FlipDot+write)
    * [.writeDrain(data)](#FlipDot+writeDrain)
    * [.matrix(rows, col, fill)](#FlipDot+matrix) ⇒ <code>matrix</code>
    * [.matrixToBytes(matrix)](#FlipDot+matrixToBytes) ⇒ <code>array</code>
    * [.writeMatrix(matrix, load)](#FlipDot+writeMatrix) ⇒ <code>array</code>
    * [.writeFrames(frames, refresh)](#FlipDot+writeFrames)
    * [.writeText(text, fontOpt, offset, invert, load)](#FlipDot+writeText) ⇒ <code>array</code>
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
| addr | <code>int</code> | Address of FlipDot display. |
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
**Returns**: <code>matrix</code> - x 2d array [rows][col].  

| Param | Type | Description |
| --- | --- | --- |
| rows | <code>int</code> | Number of rows (default size of display). |
| col | <code>int</code> | Number of columns (default size of display). |
| fill | <code>int</code> | Value to initialise array. |

<a name="FlipDot+matrixToBytes"></a>

### flipDot.matrixToBytes(matrix) ⇒ <code>array</code>
Convert matrix to array of bytes, bytes constructed from rows in each column.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - data Array of column bytes.  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>matrix</code> | 2d array returned from `this.matrix`. |

<a name="FlipDot+writeMatrix"></a>

### flipDot.writeMatrix(matrix, load) ⇒ <code>array</code>
Load matrix, ready to send on next call.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - data Array of column bytes.  

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
Write text string to display in ascii art format.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - data Array of column bytes.  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | Text to display. |
| fontOpt | <code>object</code> | figlet options { font: , horizontalLayout: , verticalLayout: }.. |
| offset | <code>array</code> | Text offset cordinates [x,y]. |
| invert | <code>bool</code> | Invert text. |
| load | <code>bool</code> | Whether to load for next send or just return encoded data. |

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
**Returns**: <code>int</code> - byte Byte.  

| Param | Type | Description |
| --- | --- | --- |
| chars | <code>array</code> | Chars representing hex value, eg: ['0','F']. |

<a name="FlipDot+byteToAscii"></a>

### flipDot.byteToAscii(byte) ⇒ <code>array</code>
Convert byte to two ascii chars representing hex value.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - asciichars Two ascii chars of hex value.  

| Param | Type | Description |
| --- | --- | --- |
| byte | <code>int</code> | Byte to convert. |

<a name="FlipDot+encode"></a>

### flipDot.encode(matrix) ⇒ <code>array</code>
Encode data for Hanover display.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - data Hanover encoded data (two ascii chars representing visual form of each byte).  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>array</code> | Array of column bytes. |

<a name="FlipDot+decode"></a>

### flipDot.decode(data) ⇒ <code>array</code>
Decode Hanover display data back to bytes

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - hex_data Bytes (will be half size of passed).  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> | Hanover display data of ascii chars representing visual form of hex byte. |

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
Send data to display over RS485 and load next from queue if available. This should be called without parameters after a `write` or `load` function. Will start task to empty queue if queued data, which will pop frames at reTask period.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>data</code> | Optional: data to send. |
| callback | <code>function</code> | Function to call once data is sent and drained. |

<a name="FlipDot+close"></a>

### flipDot.close(callback)
Close the serial port ready to clear object

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | to call when port closed |

## Modules

<dl>
<dt><a href="#module_FlipDot">FlipDot</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#FlipDot">FlipDot</a> ⇐ <code>EventEmitter.</code></dt>
<dd><p>FlipDot is a Hanover FlipDot display connected via USB RS485</p>
</dd>
</dl>

<a name="module_FlipDot"></a>

## FlipDot
<a name="exp_module_FlipDot--module.exports"></a>

### module.exports ⏏
The FlipDot display class.

**Kind**: Exported member  
<a name="FlipDot"></a>

## FlipDot ⇐ <code>EventEmitter.</code>
FlipDot is a Hanover FlipDot display connected via USB RS485

**Kind**: global class  
**Extends**: <code>EventEmitter.</code>  

* [FlipDot](#FlipDot) ⇐ <code>EventEmitter.</code>
    * [new FlipDot(port, addr, rows, columns, callback)](#new_FlipDot_new)
    * [.write(data)](#FlipDot+write)
    * [.writeDrain(data)](#FlipDot+writeDrain)
    * [.matrix(rows, col, fill)](#FlipDot+matrix) ⇒ <code>matrix</code>
    * [.matrixToBytes(matrix)](#FlipDot+matrixToBytes) ⇒ <code>array</code>
    * [.writeMatrix(matrix, load)](#FlipDot+writeMatrix) ⇒ <code>array</code>
    * [.writeFrames(frames, refresh)](#FlipDot+writeFrames)
    * [.writeText(text, fontOpt, offset, invert, load)](#FlipDot+writeText) ⇒ <code>array</code>
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
| addr | <code>int</code> | Address of FlipDot display. |
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
Encode data for Hanover display.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Hanover encoded data (two ascii chars representing visual form of each byte).  

| Param | Type | Description |
| --- | --- | --- |
| matrix | <code>array</code> | Array of column bytes. |

<a name="FlipDot+decode"></a>

### flipDot.decode(data) ⇒ <code>array</code>
Decode Hanover display data back to bytes

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  
**Returns**: <code>array</code> - Bytes (will be half size of passed).  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>array</code> | Hanover display data of ascii chars representing visual form of hex byte. |

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
Send data to display over RS485 and load next from queue if available. This should be called without parameters after a `write` or `load` function. Will start task to empty queue if queued data, which will pop frames at reTask period.

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>data</code> | Optional: data to send. |
| callback | <code>function</code> | Function to call once data is sent and drained. |

<a name="FlipDot+close"></a>

### flipDot.close(callback)
Close the serial port ready to clear object

**Kind**: instance method of [<code>FlipDot</code>](#FlipDot)  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | to call when port closed |

