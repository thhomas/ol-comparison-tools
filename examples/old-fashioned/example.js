(function(win, doc) {
  'use strict';

  var layer1 = new ol.layer.Tile({
    source: new ol.source.TileJSON({
      url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
      crossOrigin: 'anonymous'
    })
  });
  var layer2 = new ol.layer.Tile({
    source: new ol.source.OSM()
  });

  /* layer order is important here */
  var olMap = new ol.Map({
    target: doc.getElementById('map'),
    layers: [ layer1, layer2 ],
    view: new ol.View({
      center: [653600, 5723680],
      zoom: 5
    })
  });

  var control = new ol.control.ComparisonTools({
    leftLayer: layer1,
    rightLayer: layer2
  });

  olMap.addControl(control);
  control.setDisplayMode('doubleMap');

  win.changeLeftLayer = function() {
    var selectedLayer = document.getElementById("leftLayerSelect").value;
    var newLayer;
    if(selectedLayer == "osm") {
      newLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
    } else if(selectedLayer == "mapbox") {
      newLayer = new ol.layer.Tile({
        source: new ol.source.TileJSON({
          url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
          crossOrigin: 'anonymous'
        })
      });
    }
    olMap.getLayers().setAt(0, newLayer);
    control.setLeftLayer(newLayer);
  }


  win.changeRightLayer = function() {
    var selectedLayer = document.getElementById("rightLayerSelect").value;
    var newLayer;
    if(selectedLayer == "osm") {
      newLayer = new ol.layer.Tile({
        source: new ol.source.OSM()
      });
    } else if(selectedLayer == "mapbox") {
      newLayer = new ol.layer.Tile({
        source: new ol.source.TileJSON({
          url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
          crossOrigin: 'anonymous'
        })
      });
    }
    olMap.getLayers().setAt(1, newLayer);
    control.setRightLayer(newLayer);
  }


})(window, document);
