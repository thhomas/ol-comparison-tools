'use strict';

describe('scope control behaviour', function() {

  var mapDiv, comparisonTools, layer1, layer2;

  before(function() {
    mapDiv = document.createElement('div');
    mapDiv.id = 'map'
    document.body.appendChild(mapDiv);

    layer1 = new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });
    layer2 = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    comparisonTools = new ol.control.ComparisonTools({
      leftLayer: layer1,
      rightLayer: layer2
    });

    var map = new ol.Map({
      target: mapDiv,
      layers: [layer1,layer2],
      controls: [comparisonTools]
    });

  });

  it('handles clipped layer correctly.', function(done) {

    comparisonTools.getControl('scopeToggle').toggle();

    expect(comparisonTools.getControl('scopeToggle').getInteraction().layers_).to.have.lengthOf(1);

    comparisonTools.getControl('scopeToggle').toggle();
    done();

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });

});
