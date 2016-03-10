## Classes

<dl>
<dt><a href="#EZLogger">EZLogger</a></dt>
<dd></dd>
</dl>

## Objects

<dl>
<dt><a href="#EZLog">EZLog</a> : <code>object</code></dt>
<dd><p>EZLog namespace.
Can be used as a logger with default component name and topics.</p>
</dd>
</dl>

<a name="EZLogger"></a>
## EZLogger
**Kind**: global class  

* [EZLogger](#EZLogger)
    * [new EZLogger([options])](#new_EZLogger_new)
    * [.log(...item)](#EZLogger+log) ⇒ <code>String</code>
    * [.onLog(callback)](#EZLogger+onLog)
    * [.getLogById(id)](#EZLogger+getLogById) ⇒ <code>LogDocument</code>
    * [.count()](#EZLogger+count) ⇒ <code>Integer</code>
    * [.getLatestLogs(count)](#EZLogger+getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.getEarliestLogs(count)](#EZLogger+getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.wipe()](#EZLogger+wipe) ⇒ <code>Integer</code>
    * [.publish()](#EZLogger+publish)
    * [.subscribe(limit)](#EZLogger+subscribe) ⇒ <code>Object</code>

<a name="new_EZLogger_new"></a>
### new EZLogger([options])
Create an EZLogger instance.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional configurations. |
| [options.component] | <code>String</code> | The name of the component this logger is for. The value is case-insensitive. Default is `"default"`. |
| [options.topics] | <code>Array.&lt;String&gt;</code> | A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`. |

<a name="EZLogger+log"></a>
### ezLogger.log(...item) ⇒ <code>String</code>
Anywhere.
Log the item.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLogger+onLog"></a>
### ezLogger.onLog(callback)
Anywhere.
Register a function to be called when there is a new log.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLogger+getLogById"></a>
### ezLogger.getLogById(id) ⇒ <code>LogDocument</code>
Anywhere.
Find and return the log document specified by its id.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLogger+count"></a>
### ezLogger.count() ⇒ <code>Integer</code>
Anywhere.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLogger+getLatestLogs"></a>
### ezLogger.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Find and return the latest log documents.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLogger+getEarliestLogs"></a>
### ezLogger.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Find and return the earliest log documents.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLogger+wipe"></a>
### ezLogger.wipe() ⇒ <code>Integer</code>
Server.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLogger+publish"></a>
### ezLogger.publish()
Server.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
<a name="EZLogger+subscribe"></a>
### ezLogger.subscribe(limit) ⇒ <code>Object</code>
Client.
Subscribe the latest log documents of this logger.

**Kind**: instance method of <code>[EZLogger](#EZLogger)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

<a name="EZLog"></a>
## EZLog : <code>object</code>
EZLog namespace.
Can be used as a logger with default component name and topics.

**Kind**: global namespace  

* [EZLog](#EZLog) : <code>object</code>
    * [.createLogger([options])](#EZLog.createLogger) ⇒ <code>[EZLogger](#EZLogger)</code>
    * [.log(...item)](#EZLog.log) ⇒ <code>String</code>
    * [.onLog(callback)](#EZLog.onLog)
    * [.getLogById(id)](#EZLog.getLogById) ⇒ <code>LogDocument</code>
    * [.count()](#EZLog.count) ⇒ <code>Integer</code>
    * [.getLatestLogs(count)](#EZLog.getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.getEarliestLogs(count)](#EZLog.getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.wipe()](#EZLog.wipe) ⇒ <code>Integer</code>
    * [.publish()](#EZLog.publish)
    * [.subscribe(limit)](#EZLog.subscribe) ⇒ <code>Object</code>

<a name="EZLog.createLogger"></a>
### EZLog.createLogger([options]) ⇒ <code>[EZLogger](#EZLogger)</code>
Create an EZLogger instance.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional configurations. |
| [options.component] | <code>String</code> | The name of the component this logger is for. The value is case-insensitive. Default is `"default"`. |
| [options.topics] | <code>Array.&lt;String&gt;</code> | A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`. |

<a name="EZLog.log"></a>
### EZLog.log(...item) ⇒ <code>String</code>
Anywhere.
Log the item.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLog.onLog"></a>
### EZLog.onLog(callback)
Anywhere.
Register a function to be called when there is a new log.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLog.getLogById"></a>
### EZLog.getLogById(id) ⇒ <code>LogDocument</code>
Anywhere.
Find and return the log document specified by its id.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLog.count"></a>
### EZLog.count() ⇒ <code>Integer</code>
Anywhere.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLog.getLatestLogs"></a>
### EZLog.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Find and return the latest log documents.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.getEarliestLogs"></a>
### EZLog.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Find and return the earliest log documents.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.wipe"></a>
### EZLog.wipe() ⇒ <code>Integer</code>
Server.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLog.publish"></a>
### EZLog.publish()
Server.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
<a name="EZLog.subscribe"></a>
### EZLog.subscribe(limit) ⇒ <code>Object</code>
Client.
Subscribe the latest log documents of this logger.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

