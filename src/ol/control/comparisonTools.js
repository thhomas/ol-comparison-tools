/** An Control bar with comparison tools
 * The display bar is a container for other controls. It is an extension of Control Bar
 *
 * @constructor
 * @extends {ol.control.Bar}
 * @param {Object=} opt_options Control options.
 *    className {String} class of the control
 *    group {bool} is a group, default false
 *    rightLayer {ol.layer} layer to compare to
 *    leftLayer {ol.layer} layer compared
 *    toggleOne {bool} only one toggle control is active at a time, default false
 *    autoDeactivate {bool} used with subbar to deactivate all control when top level control deactivate, default false
 *    displayMode {string}
 *    controlNames {Array.<string>} a list of control name to add to the comparison toolset (can be 'hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap')
 */
ol.control.ComparisonTools = function(options)  {
  if(!options) {
    options = {};
  }

  this.controls_ = [];
  this.clonedMap_;
  this.rightLayer_;
  this.leftLayer_;
  this.displayMode_ = 'normal';

  ol.control.Bar.call(this, {
    group: true,
    toggleOne: true,
    className: options.className,
    controls: this.controls_
  });

  var controlNames = options.controlNames || ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap'];

  if(options.rightLayer) {
    this.rightLayer_ = options.rightLayer;
  }
  if(options.leftLayer) {
    this.leftLayer_ = options.leftLayer;
  }


  for(var i=0; i<controlNames.length; i++) {
    var controlName = controlNames[i];
    if(controlName === 'vSlider') {
      var verticalControl = new ol.control.Toggle({
        html: '<i class="fa fa-arrows-v"></i>',
        className: 'vertical-button',
        title: 'Comparaison verticale',
        active: false
      });
      verticalControl.set('name', controlName+'Toggle');
      verticalControl.on('change:active', function(event) {
        // add/remove swipe control
        var vSwipeControl;
        if(event.active) {
          this.setDisplayMode('vSlider');
          vSwipeControl = new ol.control.Swipe({
            layers: this.getLeftLayer(),
            rightLayers: this.getRightLayer(),
            orientation: 'vertical'
          });
          vSwipeControl.set('name', 'vSlider');
          this.getMap().addControl(vSwipeControl);
          this.dispatchEvent('change');
        } else {
          // set displayMode to normal when control is toggled off
          if(this.getDisplayMode() === 'vSlider') {
            this.setDisplayMode('normal');
          }
          var vSwipeControl;
          this.getMap().getControls().forEach(function(control) {
            if(control.get('name') === 'vSlider') {
              vSwipeControl = control;
            }
          });
          if(vSwipeControl) {
            this.getMap().removeControl(vSwipeControl);
          }
        }
      }, this);
      this.addControl(verticalControl);
    } else if(controlName === 'hSlider') {
      var horizontalControl = new ol.control.Toggle({
        html: '<i class="fa fa-arrows-h"></i>',
        className: 'horizontal-button',
        title: 'Comparaison horizontale',
        active: false,
      });
      horizontalControl.set('name', controlName+'Toggle');
      horizontalControl.on('change:active', function(event) {
        // add/remove swipe control
        var hSwipeControl;
        if(event.active) {
          this.setDisplayMode('hSlider');
          hSwipeControl = new ol.control.Swipe({
            layers: this.getLeftLayer(),
            rightLayers: this.getRightLayer(),
            orientation: 'horizontal'
          });
          hSwipeControl.set('name', 'hSlider');
          this.getMap().addControl(hSwipeControl);
          this.dispatchEvent('change');
        } else {
          // set displayMode to normal when control is toggled off
          if(this.getDisplayMode() === 'hSlider') {
            this.setDisplayMode('normal');
          }
          var hSwipeControl;
          this.getMap().getControls().forEach(function(control) {
            if(control.get('name') === 'hSlider') {
              hSwipeControl = control;
            }
          });
          if(hSwipeControl) {
            this.getMap().removeControl(hSwipeControl);
          }
        }
      }, this);
      this.addControl(horizontalControl);
    } else if(controlName === 'scope') {
      var scopeControl = new ol.control.Toggle({
        html: '<i class="fa fa-circle-o"></i>',
        className: 'scope-button',
        name: 'scope',
        title: 'Loupe',
        active: false
      });
      scopeControl.set('name', controlName+'Toggle');
      scopeControl.on('change:active', function(event) {
        // add layer to clip interaction, activation of interaction is handled by ol.control.Toggle object
        if(event.active) {
          this.setDisplayMode('scope');
          scopeControl.setInteraction(new ol.interaction.Clip({
            radius: 200
          }));
          // add clip interaction to map
          this.getMap().addInteraction(scopeControl.getInteraction());
          scopeControl.getInteraction().addLayer(this.getRightLayer());
        } else {
          // set displayMode to normal when control is toggled off
          if(this.getDisplayMode() === 'scope') {
            this.setDisplayMode('normal');
          }
          scopeControl.getInteraction().removeLayer(this.getRightLayer());
          // remove clip interaction from map
          this.getMap().removeInteraction(scopeControl.getInteraction());;
          scopeControl.setInteraction();
        }
      }, this);
      this.addControl(scopeControl);
    } else if(controlName === 'clipLayer') {
      var clipLayerControl = new ol.control.Toggle({
        html: '<i class="fa fa-eye"></i>',
        className: 'clipLayer-button',
        title: 'Masquer',
        active: false
      });
      clipLayerControl.set('name', controlName+'Toggle');
      clipLayerControl.on('change:active', function(event) {
        // show/hide top layer
        if(event.active) {
          this.setDisplayMode('clipLayer');
          this.getRightLayer().setVisible(false);
          // add fa-eye-slash to icon
          $(event.target.element).find('.fa').addClass('fa-eye-slash');
          this.dispatchEvent('change');
        } else {
          // set displayMode to normal when control is toggled off
          if(this.getDisplayMode() === 'clipLayer') {
            this.setDisplayMode('normal');
          }
          if(this.getDisplayMode() !== 'doubleMap') {
            this.getRightLayer().setVisible(true);
          }
          // remove fa-eye-slash to icon
          $(event.target.element).find('.fa').removeClass('fa-eye-slash');
        }
      }, this);
      this.addControl(clipLayerControl);
    } else if(controlName === 'doubleMap') {

      var doubleMapControl = new ol.control.Toggle({
        html: '<i class="fa fa-pause"></i>',
        className: 'doubleMap-button',
        name: 'doubleMap',
        title: 'Double affichage',
        active: false
      });
      doubleMapControl.set('name', controlName+'Toggle');
      doubleMapControl.on('change:active', function(event) {
        // show/hide cloned map
        var map = this.getMap();
        var clonedMap = event.target.get('clonedMap');
        var clonedMapLayersGroup = event.target.get('clonedMapLayersGroup');
        var mapDiv = $(map.getViewport().parentElement);
        var mapDiv2 = mapDiv.siblings('#'+mapDiv.attr('id') + '-cloned');

        if(event.active) {
          this.setDisplayMode('doubleMap');
          mapDiv2.css({'float': 'left'});
          mapDiv2.css({'width': '50%'});
          mapDiv.css({'width': '50%'});
          mapDiv.css({'float': 'left'});

          mapDiv2.show();
          mapDiv2.css({'height': mapDiv.height() + 'px'});

          // in cloned map, move right layer from map to cloned map
          this.clonedLayer = new ol.layer.Tile(this.getRightLayer().getProperties());
          this.clonedLayer.setVisible(true);
          this.getRightLayer().setVisible(false);
          clonedMapLayersGroup.getLayers().setAt(0, this.clonedLayer);


          clonedMap.updateSize();
          this.dispatchEvent('change');

        } else {
          // set displayMode to normal when control is toggled off
          if(this.getDisplayMode() === 'doubleMap') {
            this.setDisplayMode('normal');
          }

          mapDiv2.hide();
          mapDiv2.css({'width': '100%'});
          mapDiv.css({'width': '100%'});


          // in cloned map, move right layer from cloned map to map
          clonedMapLayersGroup.getLayers().remove(this.clonedLayer);
          if(this.getDisplayMode() !== 'clipLayer') {
            this.getRightLayer().setVisible(true);
          }
        }
        this.getMap().updateSize();
      }, this);
      this.addControl(doubleMapControl);
    }
  }


};
ol.inherits(ol.control.ComparisonTools, ol.control.Bar);

ol.control.ComparisonTools.prototype.setMap = function(map) {
  ol.control.Bar.prototype.setMap.call(this, map);

  var doubleMapControl = this.getControl('doubleMapToggle');
  if(doubleMapControl) {

    // if doubleMapControl, create cloned map
    var mapDiv = $(map.getViewport().parentElement);
    var mapId = mapDiv.attr('id');
    if(mapId === undefined) {
      throw new EvalError('ol.Map div must have an id.');
    }
    var mapDiv2 = $('<div id="' + mapId + '-cloned"></div>');
    mapDiv2.hide();

    mapDiv.parent().append(mapDiv2);

    this.clonedMap_ = new ol.Map({
      target: mapDiv2[0],
      renderer: map.renderer,
      interactions: ol.interaction.defaults(),
      view: map.getView(),
      controls: [
        new ol.control.Zoom({
          zoomInTipLabel: 'Zoom avant',
          zoomOutTipLabel: 'Zoom arrière'
        }),
        new ol.control.Rotate(),
        ol.control.GeoportalAttribution !== undefined ? new ol.control.GeoportalAttribution() : new ol.control.Attribution()
      ]
    });

    var clonedMapLayersGroup = new ol.layer.Group();
    this.clonedMap_.addLayer(clonedMapLayersGroup);

    // add synchronize interaction between maps
    map.addInteraction( new ol.interaction.Synchronize({maps: [this.clonedMap_]}));
    this.clonedMap_.addInteraction( new ol.interaction.Synchronize({maps: [map]}));

    doubleMapControl.set('clonedMap', this.clonedMap_);
    doubleMapControl.set('clonedMapLayersGroup', clonedMapLayersGroup);
  }
};

/**
 * Get comparison control by its name
 * @param {string} name name of control
 * @return {ol.control.Control|undefined} control control returned
 */
ol.control.ComparisonTools.prototype.getControl = function(name) {
  for(var i=0; i<this.controls_.length; i++) {
    if(this.controls_[i].get('name') === name) {
      return this.controls_[i];
    }
  }
};


/**
 * Set displayMode_
 * @param {string} display mode ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap']
 */
ol.control.ComparisonTools.prototype.setDisplayMode = function(displayMode) {
  this.displayMode_ = displayMode;
};

/**
 * Get displayMode_ value
 * @return {string} displayMode_
 */
 ol.control.ComparisonTools.prototype.getDisplayMode = function() {
  return this.displayMode_;
 };

/**
 * Set right layer for comparison
 * @param {ol.layer} layer
 */
 ol.control.ComparisonTools.prototype.setRightLayer = function(layer) {

  if(this.getDisplayMode() === 'vSlider') {
    var vSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'vSlider') {
        vSwipeControl = control;
      }
    });
    vSwipeControl.removeLayer(this.rightLayer_);
    vSwipeControl.addLayer(layer, true);
  } else if(this.getDisplayMode() === 'hSlider') {
    var hSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'hSlider') {
        hSwipeControl = control;
      }
    });
    hSwipeControl.removeLayer(this.rightLayer_);
    hSwipeControl.addLayer(layer, true);
  } else if(this.getDisplayMode() === 'clipLayer') {
    layer.setVisible(this.rightLayer_.getVisible());
  } else if(this.getDisplayMode() === 'scope') {
    var interaction = this.getControl('scopeToggle').getInteraction();
    interaction.removeLayer(this.rightLayer_);
    interaction.addLayer(layer);
  } else if(this.getDisplayMode() === 'doubleMap') {
    this.clonedLayer = new ol.layer.Tile(layer.getProperties());
    this.getControl('doubleMapToggle').get('clonedMapLayersGroup').getLayers().setAt(0, this.clonedLayer);

    layer.setVisible(false);
  }
  this.rightLayer_ = layer;

};

/**
 * Set left layer for comparison
 * @param {ol.layer} layer
 */
ol.control.ComparisonTools.prototype.setLeftLayer = function(layer) {
  this.leftLayer_ = layer;
  var vSwipeControl;
  this.getMap().getControls().forEach(function(control) {
    if(control.get('name') === 'vSlider') {
      vSwipeControl = control;
    }
  });
  if(vSwipeControl) {
    vSwipeControl.addLayer(this.leftLayer_);
  }
  var hSwipeControl;
  this.getMap().getControls().forEach(function(control) {
    if(control.get('name') === 'hSlider') {
      hSwipeControl = control;
    }
  });
  if(hSwipeControl) {
    hSwipeControl.addLayer(this.leftLayer_);
  }
 };

/**
 * Get right layer
 * @return {ol.layer} layer
 */
ol.control.ComparisonTools.prototype.getRightLayer = function() {
  return this.rightLayer_;
};

/**
 * Get left layer
 * @return {ol.layer} layer
 */
ol.control.ComparisonTools.prototype.getLeftLayer = function() {
  return this.leftLayer_;
};

/**
 * Get cloned map
 * @return {ol.map} cloned map
 */
ol.control.ComparisonTools.prototype.getClonedMap = function() {
  return this.clonedMap_;
}
