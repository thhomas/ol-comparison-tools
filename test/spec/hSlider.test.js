'use strict';

describe('hSlider control behaviour', function() {

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

  it('handles swipe between left and right layer correctly.', function(done) {

    comparisonTools.getControl('hSliderToggle').toggle();
    var hSwipeControl;
    map.getControls().forEach(function(control) {
      if(control.get('name') === 'hSlider') {
        hSwipeControl = control;
      }
    });

    expect(hSwipeControl).to.not.equal(undefined);
    expect(hSwipeControl.get('orientation')).to.be.equal('horizontal');

    expect(hSwipeControl.layers[0].layer).to.be.equal(layer1);
    expect(hSwipeControl.layers[0].right).to.be.equal(false);
    expect(hSwipeControl.layers[1].layer).to.be.equal(layer2);
    expect(hSwipeControl.layers[1].right).to.be.equal(true);

    // TODO find a way to check if precompose and postcompose listeners have been correctly set
    // needs openlayers to provide a way to get listeners

    comparisonTools.getControl('hSliderToggle').toggle();
    done();

  });

  it('handles move of slider correctly.', function() {
    comparisonTools.getControl('hSliderToggle').toggle();

    var hSwipeControl;
    map.getControls().forEach(function(control) {
      if(control.get('name') === 'hSlider') {
        hSwipeControl = control;
      }
    });

    expect(hSwipeControl.get('position')).to.be.equal(0.5);

    var event = new Event('mousedown');
    event.pageY = 1000;
    document.getElementsByClassName('ol-swipe horizontal')[0].dispatchEvent(event);

    expect(hSwipeControl.get('position')).to.be.not.equal(0.5);

    hSwipeControl.set('position', 0.5);

    var event = new Event('mousedown');
    event.pageY = -1000;
    document.getElementsByClassName('ol-swipe horizontal')[0].dispatchEvent(event);

    expect(hSwipeControl.get('position')).to.be.not.equal(0.5);

  });

  after(function() {
    document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
    document.body.removeChild(mapDiv);
  });

});
