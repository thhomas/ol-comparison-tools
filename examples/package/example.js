import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {TileJSON as TileJSONSource, OSM as OSMSource} from 'ol/source.js';

import {ComparisonTools as ComparisonToolsControl} from '../../src/control.js'
import {HistogramMatching as HistogramMatchingControl} from '../../src/control.js'

var layer1 = new TileLayer({
  source: new TileJSONSource({
    url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
    crossOrigin: 'anonymous'
  })
});
var layer2 = new TileLayer({
  source: new OSMSource()
});

/* layer order is important here */
var olMap = new Map({
  target: window.document.getElementById('map'),
  layers: [ layer1, layer2 ],
  view: new View({
    center: [653600, 5723680],
    zoom: 5
  })
});

var ccontrol = new ComparisonToolsControl({
  leftLayer: layer1,
  rightLayer: layer2
});

var hcontrol = new HistogramMatchingControl({
  layer1: layer1,
  layer2: layer2
});

olMap.addControl(ccontrol);
olMap.addControl(hcontrol);
ccontrol.setDisplayMode('doubleMap');



window.changeLeftLayer = function() {
  var selectedLayer = document.getElementById("leftLayerSelect").value;
  var newLayer;
  if(selectedLayer == "osm") {
    newLayer = new TileLayer({
      source: new OSMSource()
    });
  } else if(selectedLayer == "mapbox") {
    newLayer = new TileLayer({
      source: new TileJSONSource({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });
  }
  olMap.getLayers().setAt(0, newLayer);
  ccontrol.setLeftLayer(newLayer);
}


window.changeRightLayer = function() {
  var selectedLayer = document.getElementById("rightLayerSelect").value;
  var newLayer;
  if(selectedLayer == "osm") {
    newLayer = new TileLayer({
      source: new OSMSource()
    });
  } else if(selectedLayer == "mapbox") {
    newLayer = new TileLayer({
      source: new TileJSONSource({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });
  }
  olMap.getLayers().setAt(1, newLayer);
  ccontrol.setRightLayer(newLayer);
}
