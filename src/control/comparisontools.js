/**
 * @module ol/control/comparisontools
 */

import ol_inherits from '../util';
import {Zoom as ol_control_Zoom, Rotate as ol_control_Rotate, Attribution as ol_control_Attribution} from 'ol/control.js';
import {Map as ol_Map} from 'ol';
import {defaults as ol_defaultInteractions} from 'ol/interaction.js';
import {Tile as ol_layer_Tile} from 'ol/layer.js';
import ol_control_Bar from 'ol-ext/control/Bar.js';
import ol_interaction_Synchronize from 'ol-ext/interaction/Synchronize.js';
import ol_control_Toggle from 'ol-ext/control/Toggle.js';
import ol_control_Swipe from 'ol-ext/control/Swipe.js';
import ol_interaction_Clip from 'ol-ext/interaction/Clip.js';

/**
 * @classdesc
 * An Control bar with comparison tools
 * The display bar is a container for other controls. It is an extension of Control Bar
 *
 * @constructor
 * @extends {module:ol-ext/control/Bar}
 * @param {Object=} opt_options Control options.
 *    className {String} class of the control
 *    group {bool} is a group, default false
 *    rightLayer {module:ol/layer} layer to compare to
 *    leftLayer {module:ol/layer} layer compared
 *    toggleOne {bool} only one toggle control is active at a time, default false
 *    autoDeactivate {bool} used with subbar to deactivate all control when top level control deactivate, default false
 *    displayMode {string}
 *    controlNames {Array.<string>} a list of control name to add to the comparison toolset (can be 'hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap')
 */
const ol_control_ComparisonTools = function(options)  {
  if(!options) {
    options = {};
  }
  let self = this;

  this.controls_ = [];
  this.clonedMap_;
  this.clonedLayer_;
  this.rightLayer_;
  this.leftLayer_;
  this.useCloneLayer_ = false;
  this.layerGroup_;

  this.vSwipeControl_;
  this.hSwipeControl_;

  ol_control_Bar.call(this, {
    group: true,
    toggleOne: true,
    className: options.className,
    controls: this.controls_
  });

  let controlNames = options.controlNames || ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap'];

  if(options.rightLayer) {
    this.rightLayer_ = options.rightLayer;
  }
  if(options.leftLayer) {
    this.leftLayer_ = options.leftLayer;
  }

  if(options.layerGroup) {
    this.layerGroup_ = options.layerGroup;
  }


  this.useCloneLayer_ = options.useCloneLayer === true ? options.useCloneLayer :false;


  for(let i=0; i<controlNames.length; i++) {
    let controlName = controlNames[i];
    if(controlName === 'vSlider') {
      let verticalControl = new ol_control_Toggle({
        html: '<i class="fa fa-arrows-v"></i>',
        className: 'vertical-button',
        title: 'Comparaison verticale',
        active: false
      });
      verticalControl.set('name', controlName+'Toggle');
      verticalControl.on('change:active', function(event) {
        self.onVerticalControlChange_(event, self);
      });
      this.addControl(verticalControl);
    } else if(controlName === 'hSlider') {
      let horizontalControl = new ol_control_Toggle({
        html: '<i class="fa fa-arrows-h"></i>',
        className: 'horizontal-button',
        title: 'Comparaison horizontale',
        active: false,
      });
      horizontalControl.set('name', controlName+'Toggle');
      horizontalControl.on('change:active', function(event) {
        self.onHorizontalControlChange_(event, self);
      });
      this.addControl(horizontalControl);
    } else if(controlName === 'scope') {
      let scopeControl = new ol_control_Toggle({
        html: '<i class="fa fa-circle-o"></i>',
        className: 'scope-button',
        name: 'scope',
        title: 'Loupe',
        active: false
      });
      scopeControl.set('name', controlName+'Toggle');
      scopeControl.on('change:active', function(event) {
        self.onScopeControlChange_(event, self);
      });
      this.addControl(scopeControl);
    } else if(controlName === 'clipLayer') {
      let clipLayerControl = new ol_control_Toggle({
        html: '<i class="fa fa-eye"></i>',
        className: 'clipLayer-button',
        title: 'Masquer',
        active: false
      });
      clipLayerControl.set('name', controlName+'Toggle');
      clipLayerControl.on('change:active', function(event) {
        self.onClipLayerControlChange_(event, self);
      });
      this.addControl(clipLayerControl);
    } else if(controlName === 'doubleMap') {

      let doubleMapControl = new ol_control_Toggle({
        html: '<i class="fa fa-pause"></i>',
        className: 'doubleMap-button',
        name: 'doubleMap',
        title: 'Double affichage',
        active: false
      });
      doubleMapControl.set('name', controlName+'Toggle');
      doubleMapControl.on('change:active', function(event) {
        self.onDoubleMapControlChange_(event, self);
      });
      this.addControl(doubleMapControl);
    }
  }


};
ol_inherits(ol_control_ComparisonTools, ol_control_Bar);

ol_control_ComparisonTools.prototype.setMap = function(map) {
  ol_control_Bar.prototype.setMap.call(this, map);

  if(!this.layerGroup_) {
    this.layerGroup_ = this.getMap().getLayerGroup();
  }

  let doubleMapControl = this.getControl('doubleMapToggle');
  if(doubleMapControl) {

    // if doubleMapControl, create cloned map
    let mapDiv = map.getViewport().parentElement;
    let mapId = mapDiv.id;
    if(mapId === undefined) {
      throw new EvalError('ol.Map div must have an id.');
    }
    let mapDiv2 = document.createElement('div');
    mapDiv2.id=mapId + '-cloned';
    mapDiv2.hidden = true;

    mapDiv.parentElement.appendChild(mapDiv2);

    map.clonedMap_ = new ol_Map({
      target: mapDiv2,
      view: map.getView(),
      controls: [
        new ol_control_Zoom({
          zoomInTipLabel: 'Zoom avant',
          zoomOutTipLabel: 'Zoom arrière'
        }),
        new ol_control_Rotate(),
        new ol_control_Attribution()
      ]
    });

    // add synchronize interaction between maps
    map.addInteraction( new ol_interaction_Synchronize({maps: [map.clonedMap_]}));
    map.clonedMap_.addInteraction( new ol_interaction_Synchronize({maps: [map]}));

  }
};

/**
 * Get comparison control by its name
 * @param {string} name name of control
 * @return {module:ol/control/Control|undefined} control control returned
 */
ol_control_ComparisonTools.prototype.getControl = function(name) {
  for(let i=0; i<this.getControls().length; i++) {
    if(this.getControls()[i].get('name') === name) {
      return this.getControls()[i];
    }
  }
};

/**
 * @private
 */
ol_control_ComparisonTools.prototype.onVerticalControlChange_ = function(event) {
  if(event.active) {
    this.vSwipeControl_ = new ol_control_Swipe({
      layers: this.getLeftLayer(),
      rightLayers: this.getRightLayer(),
      orientation: 'vertical'
    });
    this.vSwipeControl_.set('name', 'vSlider');
    this.getMap().addControl(this.vSwipeControl_);
  } else if(this.vSwipeControl_) {
    this.getMap().removeControl(this.vSwipeControl_);
    this.vSwipeControl_ = undefined;
  }
}

/**
 * @private
 */
ol_control_ComparisonTools.prototype.onHorizontalControlChange_ = function(event) {
  if(event.active) {
    this.hSwipeControl_ = new ol_control_Swipe({
      layers: this.getLeftLayer(),
      rightLayers: this.getRightLayer(),
      orientation: 'horizontal'
    });
    this.hSwipeControl_.set('name', 'hSlider');
    this.getMap().addControl(this.hSwipeControl_);
  } else if(this.hSwipeControl_) {
    this.getMap().removeControl(this.hSwipeControl_);
    this.hSwipeControl_ = undefined;
  }
}

/**
 * @private
 */
ol_control_ComparisonTools.prototype.onScopeControlChange_ = function(event) {
  let scopeToggleControl = this.getControl('scopeToggle');
  if(event.active) {
    scopeToggleControl.setInteraction(new ol_interaction_Clip({
      radius: 200
    }));
    // add clip interaction to map
    this.getMap().addInteraction(scopeToggleControl.getInteraction());
    scopeToggleControl.getInteraction().addLayer(this.getRightLayer());
  } else if(scopeToggleControl.getInteraction()) {
    scopeToggleControl.getInteraction().removeLayer(this.getRightLayer());
    // remove clip interaction from map
    this.getMap().removeInteraction(scopeToggleControl.getInteraction());
    scopeToggleControl.setInteraction();
  }
}

/**
 * @private
 */
ol_control_ComparisonTools.prototype.onClipLayerControlChange_ = function(event) {
  let clipLayerToggleControl = this.getControl('clipLayerToggle');
  if(event.active) {
    this.getRightLayer().setVisible(false);
    // set icon class to fa-eye-slash
    clipLayerToggleControl.element.getElementsByClassName('fa')[0].className = 'fa fa-eye-slash';
  } else {
    if(this.useCloneLayer_) {
      if(this.getDisplayMode() !== 'doubleMap') {
        this.getRightLayer().setVisible(true);
      }
    } else {
      this.getRightLayer().setVisible(true);
    }
    // set icon class to fa-eye
    clipLayerToggleControl.element.getElementsByClassName('fa')[0].className = 'fa fa-eye';
  }
}

/**
 * @private
 */
ol_control_ComparisonTools.prototype.onDoubleMapControlChange_ = function(event) {
  let mapDiv = this.getMap().getViewport().parentElement;
  let mapDiv2 = this.getMap().clonedMap_.getViewport().parentElement;
  if(event.active) {

    mapDiv2.style.float =  'left';
    mapDiv2.style.width =  '50%';
    mapDiv.style.width = '50%';
    mapDiv.style.float =  'left';

    mapDiv2.style.display = 'block';
    mapDiv2.style.height = mapDiv.clientHeight + 'px';

    // as we do not want control to add/remove layers on map, we add a cloned layer to cloned map
    // and we hide rightLayer from map
    if(this.useCloneLayer_) {
      this.clonedLayer_ = new ol_layer_Tile(this.getRightLayer().getProperties());
      this.clonedLayer_.setVisible(true);
      this.getRightLayer().setVisible(false);


      // change made on rightLayer are applied to clonedLayer_
      this.getRightLayer().on('change', this.updateClonedLayer_, this);

      this.getClonedMap().addLayer(this.clonedLayer_);
    } else {
      this.getRightLayer().setVisible(true);
      this.layerGroup_.getLayers().remove(this.getRightLayer());
      this.getClonedMap().addLayer(this.getRightLayer());
    }

    this.getMap().updateSize();
    this.getClonedMap().updateSize();
  } else {

    mapDiv2.style.display = 'none';
    mapDiv2.style.width = '100%';
    mapDiv.style.width = '100%';

    if(this.useCloneLayer_) {
      // in cloned map, move right layer from cloned map to map
      this.getClonedMap().removeLayer(this.clonedLayer_);
      if(this.getDisplayMode() !== 'clipLayer') {
        this.getRightLayer().setVisible(true);
      }
      // change made on rightLayer are applied to clonedLayer_
      this.getRightLayer().un('change', this.updateClonedLayer_, this);
    } else {
      if(this.getDisplayMode() !== 'clipLayer') {
        this.getRightLayer().setVisible(true);
      }
      this.getClonedMap().removeLayer(this.getRightLayer());
      this.layerGroup_.getLayers().push(this.getRightLayer());
    }
  }

  this.getMap().updateSize();
}

/**
 * Set displayMode
 * @param {string} display mode ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap']
 */
ol_control_ComparisonTools.prototype.setDisplayMode = function(displayMode) {

  if(this.getMap()) {

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
 * Get active control
 * @return {string} displayMode ['hSlider', 'vSlider', 'scope', 'clipLayer', 'doubleMap']
 */
 ol_control_ComparisonTools.prototype.getDisplayMode = function() {
  for(let i=0; i<this.getControls().length; i++) {
    if(this.getControls()[i].getActive()) {
      return this.getControls()[i].get('name').substring(0, this.getControls()[i].get('name').length - 6);
    }
  }

  return 'normal';
 };

/**
 * Set right layer for comparison
 * @param {module:ol/layer} layer
 */
 ol_control_ComparisonTools.prototype.setRightLayer = function(layer) {

   if(!this.getMap()) {
     throw new EvalError('control must be added to map before setting rightLayer.');
   }


  if(this.getDisplayMode() === 'vSlider') {
    let vSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'vSlider') {
        vSwipeControl = control;
      }
    });
    vSwipeControl.removeLayer(this.getRightLayer());
    vSwipeControl.addLayer(layer, true);
  } else if(this.getDisplayMode() === 'hSlider') {
    let hSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'hSlider') {
        hSwipeControl = control;
      }
    });
    hSwipeControl.removeLayer(this.getRightLayer());
    hSwipeControl.addLayer(layer, true);
  } else if(this.getDisplayMode() === 'clipLayer') {
    layer.setVisible(this.getRightLayer().getVisible());
  } else if(this.getDisplayMode() === 'scope') {
    let interaction = this.getControl('scopeToggle').getInteraction();
    interaction.removeLayer(this.getRightLayer());
    interaction.addLayer(layer);
  } else if(this.getDisplayMode() === 'doubleMap') {

    if(this.useCloneLayer_) {
      this.clonedLayer_.setProperties(layer.getProperties());

      // change made on rightLayer are applied to clonedLayer_
      this.getRightLayer().on('change', this.updateClonedLayer_, this);

      this.getRightLayer().setVisible(false);
    } else {
      this.getRightLayer().setVisible(true);
      this.layerGroup_.getLayers().remove(layer);
      // update layer in collection
      let self = this;
      this.getClonedMap().getLayers().forEach(function(el, index) {
        if(el === self.getRightLayer()) {
          self.getClonedMap().getLayers().setAt(index, layer);
        }
      });
    }
  }

  this.rightLayer_ = layer;

};

ol_control_ComparisonTools.prototype.updateClonedLayer_ = function() {
  this.clonedLayer_.setProperties(this.getRightLayer().getProperties());
  this.clonedLayer_.setVisible(true);
}

/**
 * Set left layer for comparison
 * @param {module:ol/layer} layer
 */
ol_control_ComparisonTools.prototype.setLeftLayer = function(layer) {

  if(!this.getMap()) {
    throw new EvalError('control must be added to map before setting leftLayer.');
  }


  if(this.getDisplayMode() === 'vSlider') {
    let vSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'vSlider') {
        vSwipeControl = control;
      }
    });
    if(vSwipeControl) {
      vSwipeControl.addLayer(this.getLeftLayer());
    }
  } else if(this.getDisplayMode() === 'hSlider') {
    let hSwipeControl;
    this.getMap().getControls().forEach(function(control) {
      if(control.get('name') === 'hSlider') {
        hSwipeControl = control;
      }
    });
    if(hSwipeControl) {
      hSwipeControl.addLayer(this.getLeftLayer());
    }
  } else if(this.getDisplayMode() === 'clipLayer') {
    layer.setVisible(this.getLeftLayer().getVisible());
  } else if(this.getDisplayMode() === 'scope') {
    // do nothing
  } else if(this.getDisplayMode() === 'doubleMap') {
    // update layer in collection
    let self = this;
    this.getMap().getLayers().forEach(function(el, index) {
      if(el === self.getLeftLayer()) {
        self.getMap().getLayers().setAt(index, layer);
      }
    });
  }

  this.leftLayer_ = layer;
 };

/**
 * Get right layer
 * @return {module:ol/layer} layer
 */
ol_control_ComparisonTools.prototype.getRightLayer = function() {
  return this.rightLayer_;
};

/**
 * Get left layer
 * @return {module:ol/layer} layer
 */
ol_control_ComparisonTools.prototype.getLeftLayer = function() {
  return this.leftLayer_;
};

/**
 * Get cloned map
 * @return {module:ol/map} cloned map
 */
ol_control_ComparisonTools.prototype.getClonedMap = function() {
  return this.getMap().clonedMap_;
}

/**
 * Set layer group
 * @param {module:ol/layer/Group} layer group where layers are added/removed
 */
ol_control_ComparisonTools.prototype.setLayerGroup = function(layerGroup) {
  this.layerGroup_ = layerGroup;
}

/**
 * Get layer group
 * @return {module:ol/layer/Group} layer group where layers are added/removed
 */
ol_control_ComparisonTools.prototype.getLayerGroup = function() {
  return this.layerGroup_;
}

/**
 * Get vertical swipe control group
 * @return {module:ol-ext/control/Swipe} vertical swipe control
 */
ol_control_ComparisonTools.prototype.getVSwipeControl = function() {
  return this.vSwipeControl_;
}

/**
 * Get horizontal swipe control group
 * @return {module:ol-ext/control/Swipe} horizontal swipe control
 */
ol_control_ComparisonTools.prototype.getHSwipeControl = function() {
  return this.hSwipeControl_;
}

/**
 * Get cloned map
 * @return {module:ol/map} cloned map
 */
ol_Map.prototype.getClonedMap = function() {
  return this.clonedMap_;
}

export default ol_control_ComparisonTools;