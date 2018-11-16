'use strict';

describe('ol.control.ComparisonTools', function() {

  var mapDiv, map, comparisonTools;

  describe('constructor', function() {

    it('throws error when no id is set to map div.', function() {
      mapDiv = document.createElement('div');
      document.body.appendChild(mapDiv);
      comparisonTools = new ol.control.ComparisonTools();
      map = new ol.Map({
        target: mapDiv
      });
      expect(function() {
        map.addControl(comparisonTools)
      }).to.throw(EvalError);
    });

    afterEach(function() {
      document.body.removeChild(mapDiv);
    });

  });

  describe('DOM elements', function() {

    before(function() {
      mapDiv = document.createElement('div');
      mapDiv.id = 'map'
      document.body.appendChild(mapDiv);
      comparisonTools = new ol.control.ComparisonTools();
      map = new ol.Map({
        target: mapDiv,
        controls: [comparisonTools]
      });

    });

    it('adds a control bar element to DOM', function() {
      expect(document.getElementsByClassName('ol-control ol-bar')).to.have.lengthOf(1);
      expect(document.getElementsByClassName('ol-control ol-bar')[0].children).to.have.lengthOf(5);
    });

    it('adds a cloned map to DOM', function() {
      expect(document.getElementById('map-cloned')).to.not.equal(null);
    });


    after(function() {
      document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
      document.body.removeChild(mapDiv);
    });


  });

  describe('control toggling', function() {

    var layer1, layer2;

    before(function() {
      mapDiv = document.createElement('div');
      mapDiv.id = 'map'
      document.body.appendChild(mapDiv);
      comparisonTools = new ol.control.ComparisonTools();
      map = new ol.Map({
        target: mapDiv,
        controls: [comparisonTools]
      });

      layer1 = new ol.layer.Tile({
        source: new ol.source.TileJSON({
          url: 'https://api.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy.json?secure',
          crossOrigin: 'anonymous'
        })
      });
      layer2 = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

    });

    it('adds toggle controls to ol.control.Bar.', function() {
      expect(comparisonTools.getControls()).to.have.lengthOf(5);
      expect(comparisonTools.getControl('hSliderToggle')).to.not.equal(null);
      expect(comparisonTools.getControl('vSliderToggle')).to.not.equal(null);
      expect(comparisonTools.getControl('scopeToggle')).to.not.equal(null);
      expect(comparisonTools.getControl('clipLayerToggle')).to.not.equal(null);
      expect(comparisonTools.getControl('doubleMapToggle')).to.not.equal(null);

    });

    it('sets displayMode to default value.', function() {
      expect(comparisonTools.getDisplayMode()).to.be.equal('normal');
    })

    it('sets rightLayer and leftLayer correctly.', function() {
      comparisonTools.setLeftLayer(layer1);
      expect(comparisonTools.getLeftLayer()).to.be.equal(layer1);
      comparisonTools.setRightLayer(layer2);
      expect(comparisonTools.getRightLayer()).to.be.equal(layer2);
    });


    it('activates hSlider control (adding a swipe control on map) when toggled and unactivate others.', function(done) {

      expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
      var hSwipeControl;
      map.getControls().forEach(function(control) {
        if(control.get('name') === 'hSlider') {
          hSwipeControl = control;
        }
      });
      expect(hSwipeControl).to.equal(undefined);
      expect(document.getElementsByClassName('ol-swipe horizontal')).to.have.lengthOf(0);

      comparisonTools.getControl('hSliderToggle').toggle();

      setTimeout(function() {
        expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(true);
        expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getDisplayMode()).to.be.equal('hSlider');
        hSwipeControl = undefined;
        map.getControls().forEach(function(control) {
          if(control.get('name') === 'hSlider') {
            hSwipeControl = control;
          }
        });
        expect(hSwipeControl).to.not.equal(undefined);
        expect(document.getElementsByClassName('ol-swipe horizontal')).to.have.lengthOf(1);
        comparisonTools.getControl('hSliderToggle').toggle();

        setTimeout(function() {
          expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getDisplayMode()).to.be.equal('normal');
          hSwipeControl = undefined;
          map.getControls().forEach(function(control) {
            if(control.get('name') === 'hsqsSlider') {
              hSwipeControl = control;
            }
          });
          expect(hSwipeControl).to.equal(undefined);
          done();
        }, 100);
      }, 100);




    });

    it('activates vSlider control (adding a swipe control on map) when toggled and unactivate others.', function(done) {

      expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
      var vSwipeControl;
      map.getControls().forEach(function(control) {
        if(control.get('name') === 'vSlider') {
          vSwipeControl = control;
        }
      });
      expect(vSwipeControl).to.equal(undefined);
      expect(document.getElementsByClassName('ol-swipe vertical')).to.have.lengthOf(0);

      comparisonTools.getControl('vSliderToggle').toggle();

      setTimeout(function() {
        expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(true);
        expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getDisplayMode()).to.be.equal('vSlider');
        map.getControls().forEach(function(control) {
          if(control.get('name') === 'vSlider') {
            vSwipeControl = control;
          }
        });
        expect(vSwipeControl).to.not.equal(undefined);
        expect(document.getElementsByClassName('ol-swipe vertical')).to.have.lengthOf(1);
        comparisonTools.getControl('vSliderToggle').toggle();

        setTimeout(function() {
          expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getDisplayMode()).to.be.equal('normal');
          vSwipeControl = undefined;
          map.getControls().forEach(function(control) {
            if(control.get('name') === 'vSlider') {
              vSwipeControl = control;
            }
          });
          expect(vSwipeControl).to.equal(undefined);
          done();
        }, 100);
      }, 100);




    });

    it('activates scope control (adding a clip interaction on map) when toggled and unactivate others.', function(done) {

      expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);

      expect(comparisonTools.getControl('scopeToggle').getInteraction()).to.be.equal(undefined);


      comparisonTools.getControl('scopeToggle').toggle();

      setTimeout(function() {
        expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(true);
        expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getDisplayMode()).to.be.equal('scope');

        expect(comparisonTools.getControl('scopeToggle').getInteraction()).to.not.equal(undefined);
        expect(comparisonTools.getControl('scopeToggle').getInteraction()).to.be.instanceof(ol.interaction.Clip);

        var clipInteraction = undefined;
        map.getInteractions().forEach(function(interaction) {
          if(interaction instanceof ol.interaction.Clip) {
            clipInteraction = interaction;
          }
        });
        expect(clipInteraction).to.not.equal(undefined);

        comparisonTools.getControl('scopeToggle').toggle();

        setTimeout(function() {
          expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getDisplayMode()).to.be.equal('normal');
          clipInteraction = undefined;
          map.getInteractions().forEach(function(interaction) {
            if(interaction instanceof ol.interaction.Clip) {
              clipInteraction = interaction;
            }
          });
          expect(clipInteraction).to.equal(undefined);

          done();

        }, 100);


      }, 100);

    });

    it('activates clipLayer control when toggled and unactivate others.', function(done) {

      expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);

      comparisonTools.getControl('clipLayerToggle').toggle();

      setTimeout(function() {
        expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(true);
        expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getDisplayMode()).to.be.equal('clipLayer');

        comparisonTools.getControl('clipLayerToggle').toggle();

        setTimeout(function() {
          expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getDisplayMode()).to.be.equal('normal');

          done();

        }, 100);


      }, 100);

    });

    it('activates doubleMap control (adds a second ol.Map and a synchronize interaction) when toggled and unactivate others.', function(done) {

      expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
      expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);

      expect(document.getElementById('map-cloned').clientHeight).to.be.equal(0);
      expect(document.getElementById('map-cloned').clientWidth).to.be.equal(0);

      comparisonTools.getControl('doubleMapToggle').toggle();

      setTimeout(function() {
        expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
        expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(true);
        expect(comparisonTools.getDisplayMode()).to.be.equal('doubleMap');

        expect(document.getElementById('map-cloned').clientHeight).to.be.greaterThan(0);
        expect(document.getElementById('map-cloned').clientWidth).to.be.greaterThan(0);

        comparisonTools.getControl('doubleMapToggle').toggle();

        setTimeout(function() {
          expect(comparisonTools.getControl('hSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('vSliderToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('scopeToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('clipLayerToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getControl('doubleMapToggle').getActive()).to.be.equal(false);
          expect(comparisonTools.getDisplayMode()).to.be.equal('normal');

          done();

        }, 100);


      }, 100);

    });

    after(function() {
      document.body.removeChild(document.getElementById(mapDiv.id+'-cloned'));
      document.body.removeChild(mapDiv);
    });

  });


});
