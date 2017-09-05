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

  it('moves right layer to cloned map.', function(done) {

    expect(map.getLayers().getArray()).to.have.lengthOf(2);
    var rightLayer = map.getLayers().item(1);

    comparisonTools.getControl('doubleMapToggle').toggle();

    expect(map.getLayers().getArray()).to.have.lengthOf(1);
    expect(mapCloned.getLayers().getArray()).to.have.lengthOf(1);
    expect(mapCloned.getLayers().item(0)).to.be.equal(rightLayer);

    done();

  });

  it('applies changed made on rightLayer to clonedLayer.', function() {

    var stamenSource = new ol.source.Stamen({
      layer: 'watercolor'
    });
    comparisonTools.getRightLayer().setSource(stamenSource);

    expect(mapCloned.getLayers().item(0).getSource()).to.be.equal(stamenSource);

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });

});

describe('doubleMap control behaviour with custom layer group', function() {

  var mapDiv, map, mapCloned, comparisonTools, layer1, layer2, layerGroup1;

  before(function() {
    mapDiv = document.createElement('div');
    mapDiv.id = 'map'
    document.body.appendChild(mapDiv);

    layerGroup1 = new ol.layer.Group();

    layer1 = new ol.layer.Tile({
      source: new ol.source.TileJSON({
        url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
        crossOrigin: 'anonymous'
      })
    });
    layer2 = new ol.layer.Tile({
      source: new ol.source.OSM()
    });

    layerGroup1.getLayers().push(layer1);
    layerGroup1.getLayers().push(layer2);

    comparisonTools = new ol.control.ComparisonTools({
      leftLayer: layer1,
      rightLayer: layer2,
      layerGroup: layerGroup1
    });

    map = new ol.Map({
      target: mapDiv,
      layers: [layerGroup1],
      controls: [comparisonTools]
    });


    mapCloned = comparisonTools.getClonedMap();

  });

  it('moves right layer to cloned map.', function(done) {

    expect(map.getLayers().getArray()).to.have.lengthOf(1);
    expect(comparisonTools.getLayerGroup().getLayers().getArray()).to.have.lengthOf(2);
    var rightLayer = comparisonTools.getLayerGroup().getLayers().item(1);

    comparisonTools.getControl('doubleMapToggle').toggle();

    expect(comparisonTools.getLayerGroup().getLayers().getArray()).to.have.lengthOf(1);
    expect(mapCloned.getLayers().getArray()).to.have.lengthOf(1);
    expect(mapCloned.getLayers().item(0)).to.be.equal(rightLayer);

    done();

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });
});
