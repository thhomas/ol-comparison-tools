# ol-comparison-tools

![](openlayers-comparison-tools.gif)

An Openlayers extension adding a control to handle comparison tools between 2 layers.

Based on [ol-ext](http://viglino.github.io/ol-ext/), some cool openlayers extension.


To make it works, it needs font-awesome css, so add:
```
 <link rel="stylesheet" href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
```

Quickstart
----------
```javascript
  var layer1 = ...
  var layer2 = ...

  /* layer order is important here */
  /* first layer in map is left layer in control */
  /* second layer in map is right layer in control */
  var olMap = new ol.Map({
    target: doc.getElementById('map'),
    layers: [ layer1, layer2 ]
  });

  var control = new ol.control.ComparisonTools({
    leftLayer: layer1,
    rightLayer: layer2
  });

  olMap.addControl(control);

```

ol-comparison-tools is available
- as a javascript module:
```javascript
import ol_control_ComparisonTools from 'ol-comparison-tools/control/ComparisonTools.js';
```
or
```javascript
import {ComparisonTools as ComparisonToolsControl} from 'ol-comparison-tools/control.js';
```
- loading the script in html:
```html
<script src="ol-comparison-tools/dist/comparisontools.min.js" type="text/javascript"></script>
```

Examples
--------

To browse examples, 

* install dependencies with `npm install`
* build them with `npm run build-examples`
* start a web server with `npm run serve` and browse to http://localhost:8080/examples/package/example.html

If you want to hack/modify the plugin, you can rebuild dist version doing `npm run build-dist`.

