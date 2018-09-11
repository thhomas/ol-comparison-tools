/**
 * @module ol/control/comparisontools
 * A  control that compute an histogram matching between two layers and adds a processed layer to map
 * cf. https://en.wikipedia.org/wiki/Histogram_matching
 */

import {inherits as ol_inherits} from 'ol';
import {Control as ol_control_Control} from 'ol/control.js';
import {Raster as ol_source_Raster} from 'ol/source.js';
import {Image as ol_layer_Image} from 'ol/layer.js';
import ol_control_Toggle from 'ol-ext/control/Toggle.js';

/**
 *
 * @constructor
 * @extends {module:ol/control/Control}
 * @param {Object=} opt_options Control options.
 *    layer1 {module:ol/Layer} layer to be reprocessed
 *    layer2 {module:ol/Layer} reference layer
 *    classCount {number} number of class used when inverting histogram
 */
const ol_control_HistogramMatching = function(options)  {
  if(!options) {
    options = {};
  }

  this.layer1_ = options.layer1;
  this.layer2_ = options.layer2;
  this.classCount_ = options.classCount ? options.classCount : 1000;

  this.layerProcessed_ = {};

  this.active_ = false;

  ol_control_Toggle.call(this, {
    html: '<i class="fa fa-bar-chart"></i>',
    className: 'ol-histogram-matching',
    title: 'Adaptation d\'histogramme',
    active: false
  });

};
ol_inherits(ol_control_HistogramMatching, ol_control_Toggle);

ol_control_HistogramMatching.prototype.setMap = function(map) {

  let me = this;
  ol_control_Control.prototype.setMap.call(this, map);
  me.on('change:active', this.onToggle_);
};

ol_control_HistogramMatching.prototype.onToggle_ = function(toggle) {

  let me = this;

  $(me.element).find('button').blur();

  if(me.getActive() === true) {

    let rasterSource = new ol_source_Raster({
      sources: [me.layer1_.getSource(), me.layer2_.getSource()],
      operationType: 'image',
      operation: me.rasterOperation_,
      lib: {
        computeHistogram: me.computeHistogram_,
        getInverseClassIndex: me.getInverseClassIndex_,
        getInverseValue: me.getInverseValue_,
        classCount: me.classCount_
      }
    });
    me.layerProcessed_ = new ol_layer_Image({
      source: rasterSource,
      name: 'processedLayer'
    });

    me.getMap().addLayer(me.layerProcessed_);

    me.getMap().on('moveend', function() {
      rasterSource.changed();
    });


  } else {

    me.getMap().removeLayer(me.layerProcessed_);
    me.getMap().render();
  }
}

ol_control_HistogramMatching.prototype.rasterOperation_ = function (inputs, data) {

  let imageData1 = inputs[0];
  let imageData2 = inputs[1];

  let histogram2 = computeHistogram(imageData2);
  let histogram1 = computeHistogram(imageData1);

  if(histogram1.count === 0 || histogram2 === undefined || histogram2.count === 0) {
    return {
      data: imageData1.data,
      width: imageData1.width,
      height: imageData1.height
    }
  }

  let options = options || {};
  //let imageData = inputs[0];
  let width = imageData1.width;
  let height = imageData1.height;
  let x = options.x ? options.x : 0;
  let y = options.y ? options.y : 0;
  let inputData = imageData1.data;
  let outputData = new Uint8ClampedArray(inputData.length);
  for (let y = 0, l = 0; y < height; ++y) {
    let pixelsAbove = y * width;
    for (let x = 0; x < width; ++x, l += 4) {
      /*if (this.isStopRequested())
          return null;*/
      let r = inputData[l];
      let g = inputData[l + 1];
      let b = inputData[l + 2];
      let a = inputData[l + 3];
      let outputIndex = l;
      outputData[outputIndex] = getInverseValue(histogram1.cumulative_red[Math.round(Math.max(0, Math.min(255, r)))], histogram2.inverse_red);
      outputData[outputIndex + 1] = getInverseValue(histogram1.cumulative_green[Math.round(Math.max(0, Math.min(255, g)))], histogram2.inverse_green);
      outputData[outputIndex + 2] = getInverseValue(histogram1.cumulative_blue[Math.round(Math.max(0, Math.min(255, b)))], histogram2.inverse_blue);
      outputData[outputIndex + 3] = 255;
    }


    //this.setProgress((y + 1) / height);
  }

  return {
    data: outputData,
    width: width,
    height: height
  };
};

ol_control_HistogramMatching.prototype.setLayer1 = function(layer) {
  let me = this;
  me.layer1_ = layer;

}

ol_control_HistogramMatching.prototype.setLayer2 = function(layer) {
  let me = this;
  me.layer2_ = layer;

}

/**
 * @private
 */
ol_control_HistogramMatching.prototype.getInverseClassIndex_ = function (value) {
    let i = Math.floor(value * classCount); // compute inverse class index
    i = Math.max(0, Math.min(i, classCount - 1)); // clamp value
    return i;
};

/**
 * @private
 */
ol_control_HistogramMatching.prototype.getInverseValue_ = function (value, inverse_values) {
    if (inverse_values == null)
        throw "inverse values cannot be undefined";
    let inverseIndex = getInverseClassIndex(value);
    // some cells may not be filled yet. If it is the case find previous and next filled cells
    // and compute a linear interpolation
    if (inverse_values[inverseIndex] == null) {
        // compute previous index
        let previousIndex = inverseIndex - 1;
        while (previousIndex >= 0 && inverse_values[previousIndex] == null)
            previousIndex--;
        if (previousIndex < 0)
            previousIndex = null;
        // compute next index
        let nextIndex = inverseIndex + 1;
        while (nextIndex < classCount && inverse_values[nextIndex] == null)
            nextIndex++;
        if (nextIndex >= classCount)
            nextIndex = null;
        // fill values from start, between two values or to the end
        if (previousIndex == null) {
            for (let index = 0; index < nextIndex; index++)
                inverse_values[index] = inverse_values[nextIndex];
        }
        else if (nextIndex == null) {
            for (let index = previousIndex + 1; index < classCount; index++)
                inverse_values[index] = inverse_values[previousIndex];
        }
        else {
            for (let index = previousIndex + 1; index < nextIndex; index++) {
                let alpha = (index - previousIndex) / (nextIndex - previousIndex);
                inverse_values[index] = (1 - alpha) * inverse_values[previousIndex] + alpha * inverse_values[nextIndex];
            }
        }
    }
    return inverse_values[inverseIndex];
};

/**
 * @private
 */
ol_control_HistogramMatching.prototype.computeHistogram_ = function(imageData) {
  let histogram = {
    red: new Array(256),
    cumulative_red: new Array(256),
    inverse_red: new Array(classCount),
    green: new Array(256),
    cumulative_green: new Array(256),
    inverse_green: new Array(classCount),
    blue: new Array(256),
    cumulative_blue: new Array(256),
    inverse_blue: new Array(classCount),
    count: 0
  };
  for(let i=0; i<256; i++) {
    histogram.red[i] = histogram.green[i] = histogram.blue[i] = 0;
  }
  // compute histogram
  let inputData = imageData.data;
  let width = imageData.width;
  let height = imageData.height;
  for (let y = 0, l = 0; y < height; ++y) {
      let pixelsAbove = y * width;
      for (let x = 0; x < width; ++x, l += 4) {
          histogram.red[inputData[l]] += 1;
          histogram.green[inputData[l + 1]] += 1;
          histogram.blue[inputData[l + 2]] += 1;
          histogram.count++;
      }
  }
  // compute cumulative
  if (histogram.count < 0.0001)
      throw "Cannot compute cumulative histogram. Count is quite zero...";
  histogram.cumulative_red[0] = histogram.red[0] / histogram.count;
  histogram.cumulative_green[0] = histogram.green[0] / histogram.count;
  histogram.cumulative_blue[0] = histogram.blue[0] / histogram.count;
  for (let i = 1; i < 256; i++) {
      histogram.cumulative_red[i] = histogram.cumulative_red[i - 1] + histogram.red[i] / histogram.count;
      histogram.cumulative_green[i] = histogram.cumulative_green[i - 1] + histogram.green[i] / histogram.count;
      histogram.cumulative_blue[i] = histogram.cumulative_blue[i - 1] + histogram.blue[i] / histogram.count;
  }
  // compute inverse
  for (let i = 0; i < classCount; i++) {
      histogram.inverse_red[i] = histogram.inverse_green[i] = histogram.inverse_blue[i] = null;
  }
  for (let i = 0; i < 255; i++) {
      histogram.inverse_red[getInverseClassIndex(histogram.cumulative_red[i])] = i;
      histogram.inverse_green[getInverseClassIndex(histogram.cumulative_green[i])] = i;
      histogram.inverse_blue[getInverseClassIndex(histogram.cumulative_blue[i])] = i;
  }

  return histogram;
};

ol_control_HistogramMatching.prototype.getLayerProcessed = function() {
  return this.layerProcessed_;
}


const Histogram = (function () {
    function Histogram() {
        this.count = 0;
        this.red = null;
        this.green = null;
        this.blue = null;
        this.modified = false;
        // cumulative histogram values (up to 1)
        this.cumulative_red = null;
        this.cumulative_green = null;
        this.cumulative_blue = null;
        this.inverse_red = null;
        this.inverse_green = null;
        this.inverse_blue = null;
        this.count = 0;
        this.red = new Array(256);
        this.green = new Array(256);
        this.blue = new Array(256);
        for (let i = 0; i < 256; i++)
            this.red[i] = this.green[i] = this.blue[i] = 0;
    }
    /* Compute an RGB histogram from a 2D context */
    Histogram.prototype.computeFromContext = function (context) {
        let canvas = context.canvas;
        let width = canvas.width;
        let height = canvas.height;
        let inputData = context.getImageData(0, 0, width, height).data;
        for (let y = 0, l = 0; y < height; ++y) {
            let pixelsAbove = y * width;
            for (let x = 0; x < width; ++x, l += 4) {
                this.red[inputData[l]] += 1;
                this.green[inputData[l + 1]] += 1;
                this.blue[inputData[l + 2]] += 1;
                this.count++;
            }
        }
        this.invalidatePrecomputation();
    };
    Histogram.prototype.computeFromCroppedContext = function(context, options) {
      let canvas = context.canvas;
      let width = options.width ? options.width : canvas.width;
      let height = options.height ? options.height : canvas.height;
      let x = options.x ? options.x : 0;
      let y = options.y ? options.y : 0;
      let inputData = context.getImageData(x, y, width, height).data;
      for (let y = 0, l = 0; y < height; ++y) {
          let pixelsAbove = y * width;
          for (let x = 0; x < width; ++x, l += 4) {
              this.red[inputData[l]] += 1;
              this.green[inputData[l + 1]] += 1;
              this.blue[inputData[l + 2]] += 1;
              this.count++;
          }
      }
      this.invalidatePrecomputation();
    };
    Histogram.prototype.compute = function(imageData) {
      let histogram = {
        red: [],
        green: [],
        blue: [],
        count: 0
      };
      let inputData = imageData.data;
      let width = imageData.width;
      let height = imageData.height;
      for (let y = 0, l = 0; y < height; ++y) {
          let pixelsAbove = y * width;
          for (let x = 0; x < width; ++x, l += 4) {
              histogram.red[inputData[l]] += 1;
              histogram.green[inputData[l + 1]] += 1;
              histogram.blue[inputData[l + 2]] += 1;
              histogram.count++;
          }
      }
      return histogram;
    }
    /* Normalize histogram by dividing red green and blue counts by the count sum */
    Histogram.prototype.computeCumulative = function () {
        if (this.count < 0.0001)
            throw "Cannot compute cumulative histogram. Count is quite zero...";
        this.cumulative_red = new Array(256);
        this.cumulative_green = new Array(256);
        this.cumulative_blue = new Array(256);
        this.cumulative_red[0] = this.red[0] / this.count;
        this.cumulative_green[0] = this.green[0] / this.count;
        this.cumulative_blue[0] = this.blue[0] / this.count;
        for (let i = 1; i < 256; i++) {
            this.cumulative_red[i] = this.cumulative_red[i - 1] + this.red[i] / this.count;
            this.cumulative_green[i] = this.cumulative_green[i - 1] + this.green[i] / this.count;
            this.cumulative_blue[i] = this.cumulative_blue[i - 1] + this.blue[i] / this.count;
        }
    };
    /** Invalidate precomputation for lazy getters */
    Histogram.prototype.invalidatePrecomputation = function () {
        this.inverse_red = null;
        this.inverse_green = null;
        this.inverse_blue = null;
        this.cumulative_red = null;
        this.cumulative_green = null;
        this.cumulative_blue = null;
    };
    /**
     * compute a class index in inverse histogram. Value must be in 0, 1 range
     * return a value between 0 (included) and INVERSE_CLASS_COUNT (excluded)
     */
    Histogram.prototype.getInverseClassIndex = function (value) {
        let i = Math.floor(value * Histogram.INVERSE_CLASS_COUNT); // compute inverse class index
        i = Math.max(0, Math.min(i, Histogram.INVERSE_CLASS_COUNT - 1)); // clamp value
        return i;
    };
    /** Lazy getter of the inverse blue value. Given value must be between 0 and 1 */
    Histogram.prototype.getInverseValue = function (value, inverse_values) {
        if (inverse_values == null)
            throw "inverse values cannot be undefined";
        let inverseIndex = this.getInverseClassIndex(value);
        // some cells may not be filled yet. If it is the case find previous and next filled cells
        // and compute a linear interpolation
        if (inverse_values[inverseIndex] == null) {
            // compute previous index
            let previousIndex = inverseIndex - 1;
            while (previousIndex >= 0 && inverse_values[previousIndex] == null)
                previousIndex--;
            if (previousIndex < 0)
                previousIndex = null;
            // compute next index
            let nextIndex = inverseIndex + 1;
            while (nextIndex < Histogram.INVERSE_CLASS_COUNT && inverse_values[nextIndex] == null)
                nextIndex++;
            if (nextIndex >= Histogram.INVERSE_CLASS_COUNT)
                nextIndex = null;
            // fill values from start, between two values or to the end
            if (previousIndex == null) {
                for (let index = 0; index < nextIndex; index++)
                    inverse_values[index] = inverse_values[nextIndex];
            }
            else if (nextIndex == null) {
                for (let index = previousIndex + 1; index < Histogram.INVERSE_CLASS_COUNT; index++)
                    inverse_values[index] = inverse_values[previousIndex];
            }
            else {
                for (let index = previousIndex + 1; index < nextIndex; index++) {
                    let alpha = (index - previousIndex) / (nextIndex - previousIndex);
                    inverse_values[index] = (1 - alpha) * inverse_values[previousIndex] + alpha * inverse_values[nextIndex];
                }
            }
        }
        return inverse_values[inverseIndex];
    };
    /** get red value. Given value is clamped to 0 - 255 included */
    Histogram.prototype.getRedCount = function (value) {
        if (this.red == null)
            throw "Histogram has not yet been filled with any pixel...";
        return this.red[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /** get green value. Given value is clamped to 0 - 255 included */
    Histogram.prototype.getGreenCount = function (value) {
        if (this.green == null)
            throw "Histogram has not yet been filled with any pixel...";
        return this.green[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /** get blue value. Given value is clamped to 0 - 255 included */
    Histogram.prototype.getBlueCount = function (value) {
        if (this.blue == null)
            throw "Histogram has not yet been filled with any pixel...";
        return this.blue[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /* get unit cumulative red value. Given value is clamped to 0 - 255 included
     * return value is in 0-1 range
     */
    Histogram.prototype.getCumulativeRed = function (value) {
        if (this.cumulative_red == null)
            this.computeCumulative();
        return this.cumulative_red[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /* get unit cumulative green value. Given value is clamped to 0 - 255 included
     * return value is in 0-1 range
     */
    Histogram.prototype.getCumulativeGreen = function (value) {
        if (this.cumulative_green == null)
            this.computeCumulative();
        return this.cumulative_green[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /* get unit cumulative blue value. Given value is clamped to 0 - 255 included
     * return value is in 0-1 range
     */
    Histogram.prototype.getCumulativeBlue = function (value) {
        if (this.cumulative_blue == null)
            this.computeCumulative();
        return this.cumulative_blue[Math.round(Math.max(0, Math.min(255, value)))];
    };
    /** Lazy getter of the inverse red value. Given value must be between 0 and 1 */
    Histogram.prototype.getInverseRedCount = function (value) {
        if (this.inverse_red == null)
            this.computeInverse();
        return this.getInverseValue(value, this.inverse_red);
    };
    /** Lazy getter of the inverse green value. Given value must be between 0 and 1 */
    Histogram.prototype.getInverseGreenCount = function (value) {
        if (this.inverse_green == null)
            this.computeInverse();
        return this.getInverseValue(value, this.inverse_green);
    };
    /** Lazy getter of the inverse blue value. Given value must be between 0 and 1 */
    Histogram.prototype.getInverseBlueCount = function (value) {
        if (this.inverse_blue == null)
            this.computeInverse();
        return this.getInverseValue(value, this.inverse_blue);
    };
    /**
     * Compute and stores inverse histogram.
     * Only 256 values are stored in the inverse histogram, intermediate values
     * will be computed and stored on the fly within getInverseValue() method call
     **/
    Histogram.prototype.computeInverse = function () {
        this.inverse_red = new Array(Histogram.INVERSE_CLASS_COUNT);
        this.inverse_green = new Array(Histogram.INVERSE_CLASS_COUNT);
        this.inverse_blue = new Array(Histogram.INVERSE_CLASS_COUNT);
        for (let i = 0; i < Histogram.INVERSE_CLASS_COUNT; i++) {
            this.inverse_red[i] = this.inverse_green[i] = this.inverse_blue[i] = null;
        }
        for (let i = 0; i < 255; i++) {
            this.inverse_red[this.getInverseClassIndex(this.getCumulativeRed(i))] = i;
            this.inverse_green[this.getInverseClassIndex(this.getCumulativeGreen(i))] = i;
            this.inverse_blue[this.getInverseClassIndex(this.getCumulativeBlue(i))] = i;
        }
    };
    // inverse cumulative histogram
    Histogram.INVERSE_CLASS_COUNT = 1000; // use readonly in TypeScript 2.0
    return Histogram;
}()); // class Histogram


export default ol_control_HistogramMatching;
