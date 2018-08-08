import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import {TileJSON as TileJSONSource, OSM as OSMSource} from 'ol/source.js';

import ComparisonTools from '../../src/control/comparisontools.js'

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

var control = new ComparisonTools({
  leftLayer: layer1,
  rightLayer: layer2
});

olMap.addControl(control);
control.setDisplayMode('doubleMap');

