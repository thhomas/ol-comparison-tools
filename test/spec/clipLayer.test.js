'use strict';

describe('clipLayer control behaviour', function() {

  var mapDiv, map, comparisonTools, layer1, layer2;

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

    map = new ol.Map({
      target: mapDiv,
      layers: [layer1,layer2],
      controls: [comparisonTools]
    });

  });

  it('hides/showe layer correctly.', function(done) {
    expect(comparisonTools.getLeftLayer().getProperties().visible).to.be.equal(true);
    expect(comparisonTools.getRightLayer().getProperties().visible).to.be.equal(true);

    comparisonTools.getControl('clipLayerToggle').toggle();

    expect(comparisonTools.getLeftLayer().getProperties().visible).to.be.equal(true);
    expect(comparisonTools.getRightLayer().getProperties().visible).to.be.equal(false);

    comparisonTools.getControl('clipLayerToggle').toggle();

    expect(comparisonTools.getLeftLayer().getProperties().visible).to.be.equal(true);
    expect(comparisonTools.getRightLayer().getProperties().visible).to.be.equal(true);

    done();

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });

});
