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
  this.clonedLayer_;
  this.rightLayer_;
  this.leftLayer_;
  this.displayMode_ = 'normal';

  this.vSwipeControl_;
  this.hSwipeControl_;

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
      verticalControl.on('change:active', this.onVerticalControlChange_, this);
      this.addControl(verticalControl);
    } else if(controlName === 'hSlider') {
      var horizontalControl = new ol.control.Toggle({
        html: '<i class="fa fa-arrows-h"></i>',
        className: 'horizontal-button',
        title: 'Comparaison horizontale',
        active: false,
      });
      horizontalControl.set('name', controlName+'Toggle');
      horizontalControl.on('change:active', this.onHorizontalControlChange_, this);
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
      scopeControl.on('change:active', this.onScopeControlChange_, this);
      this.addControl(scopeControl);
    } else if(controlName === 'clipLayer') {
      var clipLayerControl = new ol.control.Toggle({
        html: '<i class="fa fa-eye"></i>',
        className: 'clipLayer-button',
        title: 'Masquer',
        active: false
      });
      clipLayerControl.set('name', controlName+'Toggle');
      clipLayerControl.on('change:active', this.onClipLayerControlChange_, this);
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
      doubleMapControl.on('change:active', this.onDoubleMapControlChange_, this);
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

    // add synchronize interaction between maps
    map.addInteraction( new ol.interaction.Synchronize({maps: [this.clonedMap_]}));
    this.clonedMap_.addInteraction( new ol.interaction.Synchronize({maps: [map]}));

  }
};

/**
 * Get comparison control by its name
 * @param {string} name name of control
 * @return {ol.control.Control|undefined} control control returned
 */
ol.control.ComparisonTools.prototype.getControl = function(name) {
  for(var i=0; i<this.getControls().length; i++) {
    if(this.getControls()[i].get('name') === name) {
      return this.getControls()[i];
    }
  }
};

/**
 * @private
 */
ol.control.ComparisonTools.prototype.onVerticalControlChange_ = function(event) {
  if(event.active) {
    this.displayMode_ = 'vSlider';
    this.vSwipeControl_ = new ol.control.Swipe({
      layers: this.getLeftLayer(),
      rightLayers: this.getRightLayer(),
      orientation: 'vertical'
    });
    this.vSwipeControl_.set('name', 'vSlider');
    this.getMap().addControl(this.vSwipeControl_);
  } else {
    this.displayMode_ = 'normal';
    if(this.vSwipeControl_) {
      this.getMap().removeControl(this.vSwipeControl_);
      this.vSwipeControl_ = undefined;
    }
  }
}

/**
 * @private
 */
ol.control.ComparisonTools.prototype.onHorizontalControlChange_ = function(event) {
  if(event.active) {
    this.displayMode_ = 'hSlider';
    this.hSwipeControl_ = new ol.control.Swipe({
      layers: this.getLeftLayer(),
      rightLayers: this.getRightLayer(),
      orientation: 'horizontal'
    });
    this.hSwipeControl_.set('name', 'hSlider');
    this.getMap().addControl(this.hSwipeControl_);
  } else {
    this.displayMode_ = 'normal';
    if(this.hSwipeControl_) {
      this.getMap().removeControl(this.hSwipeControl_);
      this.hSwipeControl_ = undefined;
    }
  }
}

/**
 * @private
 */
ol.control.ComparisonTools.prototype.onScopeControlChange_ = function(event) {
  var scopeToggleControl = this.getControl('scopeToggle');
  if(event.active) {
    this.displayMode_ = 'scope';
    scopeToggleControl.setInteraction(new ol.interaction.Clip({
      radius: 200
    }));
    // add clip interaction to map
    this.getMap().addInteraction(scopeToggleControl.getInteraction());
    scopeToggleControl.getInteraction().addLayer(this.getRightLayer());
  } else {
    this.displayMode_ = 'normal';
    if(scopeToggleControl.getInteraction()) {
      scopeToggleControl.getInteraction().removeLayer(this.getRightLayer());
      // remove clip interaction from map
      this.getMap().removeInteraction(scopeToggleControl.getInteraction());
      scopeToggleControl.setInteraction();
    }
  }
}

/**
 * @private
 */
ol.control.ComparisonTools.prototype.onClipLayerControlChange_ = function(event) {
  var clipLayerToggleControl = this.getControl('clipLayerToggle');
  if(event.active) {
    this.displayMode_ = 'clipLayer';
    this.getRightLayer().setVisible(false);
    // set icon class to fa-eye-slash
    clipLayerToggleControl.element.getElementsByClassName('fa')[0].className = 'fa fa-eye-slash';
  } else {
    this.displayMode_ = 'normal';
    if(this.getDisplayMode() !== 'doubleMap') {
      this.getRightLayer().setVisible(true);
    }
    // set icon class to fa-eye
    clipLayerToggleControl.element.getElementsByClassName('fa')[0].className = 'fa fa-eye';
  }
}

/**
 * @private
 */
ol.control.ComparisonTools.prototype.onDoubleMapControlChange_ = function(event) {
  var doubleMapToggleControl = this.getControl('doubleMapToggle');
  var mapDiv = this.getMap().getViewport().parentElement;
  var mapDiv2 = this.getClonedMap().getViewport().parentElement; //document.getElementById(mapDiv.id+'-cloned');
  if(event.active) {
    this.displayMode_ = 'doubleMap';

    mapDiv2.style.float =  'left';
    mapDiv2.style.width =  '50%';
    mapDiv.style.width = '50%';
    mapDiv.style.float =  'left';

    mapDiv2.style.display = 'block';
    mapDiv2.style.height = mapDiv.clientHeight + 'px';

    // in cloned map, move right layer from map to cloned map
    this.clonedLayer_ = new ol.layer.Tile(this.getRightLayer().getProperties());
    this.clonedLayer_.setVisible(true);
    this.getRightLayer().setVisible(false);
    this.getClonedMap().addLayer(this.clonedLayer_);

    this.getMap().updateSize();
    this.getClonedMap().updateSize();
  } else {
    this.displayMode_ = 'normal';

    mapDiv2.style.display = 'none';
    mapDiv2.style.width = '100%';
    mapDiv.style.width = '100%';

    // in cloned map, move right layer from cloned map to map
    this.getClonedMap().removeLayer(this.clonedLayer_);
    if(this.getDisplayMode() !== 'clipLayer') {
      this.getRightLayer().setVisible(true);
    }

    this.getMap().updateSize();
  }
}

/**
 * Set displayMode_
 * @param {string} display mode ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap']
 */
ol.control.ComparisonTools.prototype.setDisplayMode = function(displayMode) {

  if(this.getMap()) {

    this.getControl('vSliderToggle').setActive(false);
    this.getControl('hSliderToggle').setActive(false);
    this.getControl('scopeToggle').setActive(false);
    this.getControl('clipLayerToggle').setActive(false);
    this.getControl('doubleMapToggle').setActive(false);

    if(displayMode === 'vSlider') {
      this.getControl('vSliderToggle').setActive(true);
    } else if(displayMode === 'hSlider') {
      this.getControl('hSliderToggle').setActive(true);
    } else if(displayMode === 'scope') {
      this.getControl('scopeToggle').setActive(true);
    } else if(displayMode === 'clipLayer') {
      this.getControl('clipLayerToggle').setActive(true);
    } else if(displayMode === 'doubleMap') {
      this.getControl('doubleMapToggle').setActive(true);
    }

  } else {
    throw new EvalError('control must be added to map before setting displayMode.');
  }
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
    this.getClonedMap().removeLayer(this.clonedLayer_);
    this.clonedLayer_ = new ol.layer.Tile(layer.getProperties());
    this.getClonedMap().addLayer(this.clonedLayer_);

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
