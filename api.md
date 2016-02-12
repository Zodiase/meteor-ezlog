<a name="EZLog"></a>
## EZLog : <code>object</code>
EZLog namespace.
Can be used as a logger with default component name and topics.

**Kind**: global namespace  

* [EZLog](#EZLog) : <code>object</code>
    * [.DefaultLogger](#EZLog.DefaultLogger) ⇐ <code>[Base](#EZLog.Base)</code>
        * [new DefaultLogger([options])](#new_EZLog.DefaultLogger_new)
        * *[.log(...item)](#EZLog.Base+log) ⇒ <code>String</code>*
        * *[.onLog(callback)](#EZLog.Base+onLog)*
        * *[.getLogById(id)](#EZLog.Base+getLogById) ⇒ <code>LogDocument</code>*
        * *[.count()](#EZLog.Base+count) ⇒ <code>Integer</code>*
        * *[.getLatestLogs(count)](#EZLog.Base+getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
        * *[.getEarliestLogs(count)](#EZLog.Base+getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
        * *[.wipe()](#EZLog.Base+wipe) ⇒ <code>Integer</code>*
        * *[.publish()](#EZLog.Base+publish)*
        * *[.subscribe(limit)](#EZLog.Base+subscribe) ⇒ <code>Object</code>*
    * *[.Base](#EZLog.Base)*
        * *[new Base([options])](#new_EZLog.Base_new)*
        * _instance_
            * **[.log(...item)](#EZLog.Base+log) ⇒ <code>String</code>**
            * **[.onLog(callback)](#EZLog.Base+onLog)**
            * **[.getLogById(id)](#EZLog.Base+getLogById) ⇒ <code>LogDocument</code>**
            * **[.count()](#EZLog.Base+count) ⇒ <code>Integer</code>**
            * **[.getLatestLogs(count)](#EZLog.Base+getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
            * **[.getEarliestLogs(count)](#EZLog.Base+getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
            * **[.wipe()](#EZLog.Base+wipe) ⇒ <code>Integer</code>**
            * **[.publish()](#EZLog.Base+publish)**
            * **[.subscribe(limit)](#EZLog.Base+subscribe) ⇒ <code>Object</code>**
        * _static_
            * **[.log(...item)](#EZLog.Base.log) ⇒ <code>String</code>**
            * **[.onLog(callback)](#EZLog.Base.onLog)**
            * **[.getLogById(id)](#EZLog.Base.getLogById) ⇒ <code>LogDocument</code>**
            * **[.count()](#EZLog.Base.count) ⇒ <code>Integer</code>**
            * **[.getLatestLogs(count)](#EZLog.Base.getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
            * **[.getEarliestLogs(count)](#EZLog.Base.getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
            * **[.wipe()](#EZLog.Base.wipe) ⇒ <code>Integer</code>**
            * **[.publish()](#EZLog.Base.publish)**
            * **[.subscribe(limit)](#EZLog.Base.subscribe) ⇒ <code>Object</code>**
    * [.log(...item)](#EZLog.log) ⇒ <code>String</code>
    * [.onLog(callback)](#EZLog.onLog)
    * [.getLogById(id)](#EZLog.getLogById) ⇒ <code>LogDocument</code>
    * [.count()](#EZLog.count) ⇒ <code>Integer</code>
    * [.getLatestLogs(count)](#EZLog.getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.getEarliestLogs(count)](#EZLog.getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>
    * [.wipe()](#EZLog.wipe) ⇒ <code>Integer</code>
    * [.publish()](#EZLog.publish)
    * [.subscribe(limit)](#EZLog.subscribe) ⇒ <code>Object</code>

<a name="EZLog.DefaultLogger"></a>
### EZLog.DefaultLogger ⇐ <code>[Base](#EZLog.Base)</code>
Default logger class.
Instantiate this with custom component name and topics.

**Kind**: static class of <code>[EZLog](#EZLog)</code>  
**Extends:** <code>[Base](#EZLog.Base)</code>  

* [.DefaultLogger](#EZLog.DefaultLogger) ⇐ <code>[Base](#EZLog.Base)</code>
    * [new DefaultLogger([options])](#new_EZLog.DefaultLogger_new)
    * *[.log(...item)](#EZLog.Base+log) ⇒ <code>String</code>*
    * *[.onLog(callback)](#EZLog.Base+onLog)*
    * *[.getLogById(id)](#EZLog.Base+getLogById) ⇒ <code>LogDocument</code>*
    * *[.count()](#EZLog.Base+count) ⇒ <code>Integer</code>*
    * *[.getLatestLogs(count)](#EZLog.Base+getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
    * *[.getEarliestLogs(count)](#EZLog.Base+getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
    * *[.wipe()](#EZLog.Base+wipe) ⇒ <code>Integer</code>*
    * *[.publish()](#EZLog.Base+publish)*
    * *[.subscribe(limit)](#EZLog.Base+subscribe) ⇒ <code>Object</code>*

<a name="new_EZLog.DefaultLogger_new"></a>
#### new DefaultLogger([options])
Create a default logger.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional configurations. |
| [options.component] | <code>String</code> | The name of the component this logger is for. The value is case-insensitive. Default is `"default"`. |
| [options.topics] | <code>Array.&lt;String&gt;</code> | A list of topics associated with this logger. The values are case-insensitive and the order doesn't matter. Default is `[]`. |

<a name="EZLog.Base+log"></a>
#### *defaultLogger.log(...item) ⇒ <code>String</code>*
Anywhere.
Log the item.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLog.Base+onLog"></a>
#### *defaultLogger.onLog(callback)*
Anywhere.
Register a function to be called when there is a new log.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLog.Base+getLogById"></a>
#### *defaultLogger.getLogById(id) ⇒ <code>LogDocument</code>*
Anywhere.
Find and return the log document specified by its id.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLog.Base+count"></a>
#### *defaultLogger.count() ⇒ <code>Integer</code>*
Anywhere.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLog.Base+getLatestLogs"></a>
#### *defaultLogger.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
Anywhere.
Find and return the latest log documents.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base+getEarliestLogs"></a>
#### *defaultLogger.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>*
Anywhere.
Find and return the earliest log documents.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base+wipe"></a>
#### *defaultLogger.wipe() ⇒ <code>Integer</code>*
Server.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLog.Base+publish"></a>
#### *defaultLogger.publish()*
Server.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
<a name="EZLog.Base+subscribe"></a>
#### *defaultLogger.subscribe(limit) ⇒ <code>Object</code>*
Client.
Subscribe the latest log documents of this logger.

**Kind**: instance abstract method of <code>[DefaultLogger](#EZLog.DefaultLogger)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

<a name="EZLog.Base"></a>
### *EZLog.Base*
Abstract logger class to be inherited.
Children should implement all of these static and instance methods.
Static methods are provided so the class can be used as a singleton instance with default configurations.

**Kind**: static abstract class of <code>[EZLog](#EZLog)</code>  

* *[.Base](#EZLog.Base)*
    * *[new Base([options])](#new_EZLog.Base_new)*
    * _instance_
        * **[.log(...item)](#EZLog.Base+log) ⇒ <code>String</code>**
        * **[.onLog(callback)](#EZLog.Base+onLog)**
        * **[.getLogById(id)](#EZLog.Base+getLogById) ⇒ <code>LogDocument</code>**
        * **[.count()](#EZLog.Base+count) ⇒ <code>Integer</code>**
        * **[.getLatestLogs(count)](#EZLog.Base+getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
        * **[.getEarliestLogs(count)](#EZLog.Base+getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
        * **[.wipe()](#EZLog.Base+wipe) ⇒ <code>Integer</code>**
        * **[.publish()](#EZLog.Base+publish)**
        * **[.subscribe(limit)](#EZLog.Base+subscribe) ⇒ <code>Object</code>**
    * _static_
        * **[.log(...item)](#EZLog.Base.log) ⇒ <code>String</code>**
        * **[.onLog(callback)](#EZLog.Base.onLog)**
        * **[.getLogById(id)](#EZLog.Base.getLogById) ⇒ <code>LogDocument</code>**
        * **[.count()](#EZLog.Base.count) ⇒ <code>Integer</code>**
        * **[.getLatestLogs(count)](#EZLog.Base.getLatestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
        * **[.getEarliestLogs(count)](#EZLog.Base.getEarliestLogs) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
        * **[.wipe()](#EZLog.Base.wipe) ⇒ <code>Integer</code>**
        * **[.publish()](#EZLog.Base.publish)**
        * **[.subscribe(limit)](#EZLog.Base.subscribe) ⇒ <code>Object</code>**

<a name="new_EZLog.Base_new"></a>
#### *new Base([options])*
Create a logger.


| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>Object</code> | Optional configurations. |

<a name="EZLog.Base+log"></a>
#### **base.log(...item) ⇒ <code>String</code>**
Anywhere.
Log the item.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLog.Base+onLog"></a>
#### **base.onLog(callback)**
Anywhere.
Register a function to be called when there is a new log.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLog.Base+getLogById"></a>
#### **base.getLogById(id) ⇒ <code>LogDocument</code>**
Anywhere.
Find and return the log document specified by its id.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLog.Base+count"></a>
#### **base.count() ⇒ <code>Integer</code>**
Anywhere.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLog.Base+getLatestLogs"></a>
#### **base.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
Anywhere.
Find and return the latest log documents.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base+getEarliestLogs"></a>
#### **base.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
Anywhere.
Find and return the earliest log documents.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base+wipe"></a>
#### **base.wipe() ⇒ <code>Integer</code>**
Server.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLog.Base+publish"></a>
#### **base.publish()**
Server.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
<a name="EZLog.Base+subscribe"></a>
#### **base.subscribe(limit) ⇒ <code>Object</code>**
Client.
Subscribe the latest log documents of this logger.

**Kind**: instance abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

<a name="EZLog.Base.log"></a>
#### **Base.log(...item) ⇒ <code>String</code>**
Anywhere.
Log the item.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLog.Base.onLog"></a>
#### **Base.onLog(callback)**
Anywhere.
Register a function to be called when there is a new log.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLog.Base.getLogById"></a>
#### **Base.getLogById(id) ⇒ <code>LogDocument</code>**
Anywhere.
Find and return the log document specified by its id.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLog.Base.count"></a>
#### **Base.count() ⇒ <code>Integer</code>**
Anywhere.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLog.Base.getLatestLogs"></a>
#### **Base.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
Anywhere.
Find and return the latest log documents.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base.getEarliestLogs"></a>
#### **Base.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>**
Anywhere.
Find and return the earliest log documents.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.Base.wipe"></a>
#### **Base.wipe() ⇒ <code>Integer</code>**
Server.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLog.Base.publish"></a>
#### **Base.publish()**
Server.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
<a name="EZLog.Base.subscribe"></a>
#### **Base.subscribe(limit) ⇒ <code>Object</code>**
Client.
Subscribe the latest log documents of this logger.

**Kind**: static abstract method of <code>[Base](#EZLog.Base)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

<a name="EZLog.log"></a>
### EZLog.log(...item) ⇒ <code>String</code>
Anywhere.
Mirrored from EZLog.DefaultLogger.
Log the item.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>String</code> - The id of the log document.  

| Param | Type | Description |
| --- | --- | --- |
| ...item | <code>\*</code> | The item to be logged. |

<a name="EZLog.onLog"></a>
### EZLog.onLog(callback)
Anywhere.
Mirrored from EZLog.DefaultLogger.
Register a function to be called when there is a new log.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The callback function. |

<a name="EZLog.getLogById"></a>
### EZLog.getLogById(id) ⇒ <code>LogDocument</code>
Anywhere.
Mirrored from EZLog.DefaultLogger.
Find and return the log document specified by its id.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>LogDocument</code> - The log document.  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | The id of the log document. |

<a name="EZLog.count"></a>
### EZLog.count() ⇒ <code>Integer</code>
Anywhere.
Mirrored from EZLog.DefaultLogger.
Return the log count.
Note that the count on client side may not reflect the count on server side.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Integer</code> - The log count.  
<a name="EZLog.getLatestLogs"></a>
### EZLog.getLatestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Mirrored from EZLog.DefaultLogger.
Find and return the latest log documents.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The latest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.getEarliestLogs"></a>
### EZLog.getEarliestLogs(count) ⇒ <code>Array.&lt;LogDocument&gt;</code>
Anywhere.
Mirrored from EZLog.DefaultLogger.
Find and return the earliest log documents.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Array.&lt;LogDocument&gt;</code> - The earliest log documents.  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Integer</code> | The amount of log documents to return. The actual returned amount may be less. |

<a name="EZLog.wipe"></a>
### EZLog.wipe() ⇒ <code>Integer</code>
Server.
Mirrored from EZLog.DefaultLogger.
Remove all existing logs.
This action creates a wipe log in the end.
This action does nothing on client side. If you want to wipe the logs from client side, trigger the action at server side.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Integer</code> - The amount of log documents got removed.  
<a name="EZLog.publish"></a>
### EZLog.publish()
Server.
Mirrored from EZLog.DefaultLogger.
Publish all the log documents of this logger.
The amount that got published is set by the subscribe function.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
<a name="EZLog.subscribe"></a>
### EZLog.subscribe(limit) ⇒ <code>Object</code>
Client.
Mirrored from EZLog.DefaultLogger.
Subscribe the latest log documents of this logger.

**Kind**: static method of <code>[EZLog](#EZLog)</code>  
**Returns**: <code>Object</code> - Same as Meteor.subscribe.  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>Integer</code> | The maximum amount of log documents to subscribe. |

