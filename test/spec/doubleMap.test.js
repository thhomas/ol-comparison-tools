'use strict';

describe('doubleMap control behaviour', function() {

  var mapDiv, map, mapCloned, comparisonTools, layer1, layer2;

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


    mapCloned = comparisonTools.getClonedMap();

  });

  it('displays/hides a cloned map alongside the map.', function(done) {

    var mapWidth = map.getViewport().clientWidth;

    expect(map.getViewport().clientWidth).to.be.equal(mapWidth);
    expect(mapCloned.getViewport().clientWidth).to.be.equal(0);

    comparisonTools.getControl('doubleMapToggle').toggle();

    expect(map.getViewport().clientWidth).to.be.equal(Math.round(mapWidth/2));
    expect(mapCloned.getViewport().clientWidth).to.be.equal(Math.round(mapWidth/2));

    comparisonTools.getControl('doubleMapToggle').toggle();

    expect(map.getViewport().clientWidth).to.be.equal(mapWidth);
    expect(mapCloned.getViewport().clientWidth).to.be.equal(0);

    done();

  });

  it('adds right layer in a groupcloned map and hides it in original map.', function(done) {

    expect(map.getLayers().getArray()).to.have.lengthOf(2);
    expect(map.getLayers().item(0).getProperties().visible).to.be.equal(true);
    expect(map.getLayers().item(0).getProperties().visible).to.be.equal(true);

    comparisonTools.getControl('doubleMapToggle').toggle();

    expect(map.getLayers().getArray()).to.have.lengthOf(2);
    expect(map.getLayers().item(0).getProperties().visible).to.be.equal(true);
    expect(map.getLayers().item(1).getProperties().visible).to.be.equal(false);
    expect(mapCloned.getLayers().getArray()).to.have.lengthOf(1);
    expect(mapCloned.getLayers().item(0).getProperties().visible).to.be.equal(true);

    done();

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });

});
