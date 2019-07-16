'use strict';

var MarkerHistory = function(historyLen) {
    this.historyLen = historyLen;
    this.historyPoints = new Array(this.historyLen);
    
    this.clear = function() {
        for (var i = 0; i < this.historyLen; i++) {
            this.historyPoints[i] = {
                x: 0,
                y: 0,
                filled: false,
            };
        }
    }
    
    this.push = function(coord) {
        this.historyPoints.shift();
        this.historyPoints.push({
            x: coord[X_INDEX],
            y: coord[Y_INDEX],
            filled: true,
        });
    }
    
    this.hasHistory = function(index) {
        if (index < 0 || index >= this.historyLen) {
            return false;
        }
        var point1 = this.historyPoints[index];
        var point2 = this.historyPoints[index + 1];
        return (point1.filled && point2.filled);
    }
    
    this.getHistory = function(index) {
        var point1 = this.historyPoints[index];
        var point2 = this.historyPoints[index + 1];
        return {
            x1: point1.x,
            y1: point1.y,
            x2: point2.x,
            y2: point2.y,
        };
    }
    
    this.init = function() {
        this.clear();
    }
    
    this.init();
}

var ModelParameters = function(data) {
    this.pointsCount = parseInt(data["points-count"].value);
    this.horizontalLines = parseInt(data["horizontal-lines"].value);
    this.verticalLines = parseInt(data["vertical-lines"].value);
    this.amplitude = parseFloat(data["amplitude"].value);
    this.lambAmplitude = parseFloat(data["lamb-amplitude"].value);
    this.scale = parseFloat(data["scale"].value);
    this.timeScale = parseFloat(data["time-scale"].value);
    this.markerHistoryLen = parseInt(data["marker-history-len"].value);
}

var Model = function(params, dimensions) {
    this.time = 0.0;
    this.params = params;
    this.dimensions = dimensions;
    this.modelDimensions = {
        width: this.dimensions.width * 0.85,
        height: this.dimensions.height * 0.85,
    };
    this.modelOrigin = {
        x: (this.dimensions.width - this.modelDimensions.width) / 2.0,
        y: (this.dimensions.height - this.modelDimensions.height) / 2.0,
    };
    this.horizontalLines = this.params.horizontalLines;
    this.verticalLines = this.params.verticalLines;
    this.pointsCount = this.params.pointsCount;

    this.horizontalCoords0 = new Float32Array(this.horizontalLines * this.pointsCount * COORD_SIZE);
    this.horizontalCoords = new Float32Array(this.horizontalLines * this.pointsCount * COORD_SIZE);

    this.verticalCoords0 = new Float32Array(this.verticalLines * this.pointsCount * COORD_SIZE);
    this.verticalCoords = new Float32Array(this.verticalLines * this.pointsCount * COORD_SIZE);

    this.init = function() {
        var dX = this.modelDimensions.width / (this.pointsCount - 1);
        var dY = this.modelDimensions.height / (this.horizontalLines - 1);

        for (var j = 0; j < this.horizontalLines; j++) {
            var pointY0 = j * dY + this.modelOrigin.y;

            for (var i = 0; i<this.pointsCount; i++) {
                var index = this.getIndex(j, i);
                var pointX0 = i * dX + this.modelOrigin.x;

                this.horizontalCoords0[index + X_INDEX] = pointX0;
                this.horizontalCoords0[index + Y_INDEX] = pointY0;

                this.horizontalCoords[index + X_INDEX] = 0.0;
                this.horizontalCoords[index + Y_INDEX] = 0.0;
            }
        }
        
        var dX = this.modelDimensions.width / (this.verticalLines - 1);
        var dY = this.modelDimensions.height / (this.pointsCount - 1);

        for (var j = 0; j < this.verticalLines; j++) {
            var pointX0 = j * dX + this.modelOrigin.x;

            for (var i = 0; i<this.pointsCount; i++) {
                var index = this.getIndex(j, i);
                var pointY0 = i * dY + this.modelOrigin.y;

                this.verticalCoords0[index + X_INDEX] = pointX0;
                this.verticalCoords0[index + Y_INDEX] = pointY0;

                this.verticalCoords[index + X_INDEX] = 0.0;
                this.verticalCoords[index + Y_INDEX] = 0.0;
            }
        }
    }

    this.getDisplacement = function(displacement, coord, time) {
        displacement[X_INDEX] = 0.0;
        displacement[Y_INDEX] = 0.0;
        return displacement;
    }

    this.getIndex = function(row, col) {
        return (row * this.pointsCount + col) * COORD_SIZE;
    }

    this.getCoord = function(coord, data, row, col) {
        var index = this.getIndex(row, col);

        coord[X_INDEX] = data[index + X_INDEX];
        coord[Y_INDEX] = data[index + Y_INDEX];

        return coord;
    }

    this.getHorizontalCoord = function(coord, row, col) {
        return this.getCoord(coord, this.horizontalCoords, row, col);
    }

    this.getVerticalCoord = function(coord, row, col) {
        return this.getCoord(coord, this.verticalCoords, row, col);
    }

    this.setCoord = function(data, coord, row, col) {
        var index = this.getIndex(row, col);

        data[index + X_INDEX] = coord[X_INDEX];
        data[index + Y_INDEX] = coord[Y_INDEX];
    }
    
    this.updateHorizontal = function(time) {
        var coord = [0.0, 0.0];
        var displacement = [0.0, 0.0];

        for (var j = 0; j < this.horizontalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                this.getCoord(coord, this.horizontalCoords0, j, i);
                
                this.getDisplacement(displacement, coord, time);

                addCoords(coord, coord, displacement);
                
                this.setCoord(this.horizontalCoords, coord, j, i);
            }
        }
    }

    this.updateVertical = function(time) {
        var coord = [0.0, 0.0];
        var displacement = [0.0, 0.0];

        for (var j = 0; j < this.verticalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                this.getCoord(coord, this.verticalCoords0, j, i);
                
                this.getDisplacement(displacement, coord, time);

                addCoords(coord, coord, displacement);
                
                this.setCoord(this.verticalCoords, coord, j, i);
            }
        }
    }
    
    this.update = function(deltaTime) {
        this.time += deltaTime;

        this.updateHorizontal(this.time);
        this.updateVertical(this.time);
    }
    
    this.init();
}

var SWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        displacement[X_INDEX] = 0.0;
        displacement[Y_INDEX] = amplitude * Math.cos(coord[X_INDEX] * scale - time * timeScale);

        return displacement;
    }
}

var PWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        displacement[X_INDEX] = amplitude * Math.cos(coord[X_INDEX] * scale - time * timeScale);
        displacement[Y_INDEX] = 0.0;

        return displacement;
    }
}

var RadialPWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveOrigin = [this.dimensions.width / 2.0, this.dimensions.height / 2.0];
     
    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var radialCoords = [0.0, 0.0];

        convertCartesianToRadial(radialCoords, coord, this.waveOrigin);
        
        var q = radialCoords.r * scale - time * timeScale;
        
        displacement[X_INDEX] = amplitude * Math.cos(radialCoords.theta) * Math.cos(q);
        displacement[Y_INDEX] = amplitude * Math.sin(radialCoords.theta) * Math.cos(q);

        return displacement;
    }
}

var RadialSWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveOrigin = [this.dimensions.width / 2.0, this.dimensions.height / 2.0];
     
    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var deltaOrigin = [0.0, 0.0];
        var radialCoords = [0.0, 0.0];

        convertCartesianToRadial(radialCoords, coord, this.waveOrigin);

        subCoords(deltaOrigin, this.waveOrigin, coord);
        
        var q = scale * radialCoords[R_INDEX] - time * timeScale;
        var theta = radialCoords[THETA_INDEX] + amplitude / radialCoords[R_INDEX] * Math.cos(q);
        
        displacement[X_INDEX] = deltaOrigin[X_INDEX] + radialCoords[R_INDEX] * Math.cos(theta);
        displacement[Y_INDEX] = deltaOrigin[Y_INDEX] + radialCoords[R_INDEX] * Math.sin(theta);

        return displacement;
    }
}

var RayleighWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.modelDepth = this.modelDimensions.height;
    this.modelTop = this.modelOrigin.y;
     
    this.getDisplacement = function(displacement, coord, time) {
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        // Horizontal and vertical amplitudes
        // are calculated as catheti of a right triangle
        // with amplitude as a hypothenuse.
        // TODO: Adjust two amplitudes independently.
        var amplitude = [
            params.amplitude / Math.sqrt(2.0),
            params.amplitude / Math.sqrt(2.0)
        ];
        
        // Depth of a point
        var currentDepth = coord[Y_INDEX] - this.modelTop;
        
        var delta = currentDepth / this.modelDepth;
        var currentAmplitude = [
            // Horizontal amplitude is a cosine function.
            // X Amplitude = max at the top and 0 at the bottom
            amplitude[X_INDEX] * Math.exp(-delta),

            // Vertical amplitude is a linear function.
            amplitude[Y_INDEX] * Math.exp(-delta)
        ];
        
        var phi = coord[X_INDEX] * scale - time * timeScale;
        
        displacement[X_INDEX] = currentAmplitude[X_INDEX] * Math.cos(phi);
        displacement[Y_INDEX] = currentAmplitude[Y_INDEX] * Math.sin(phi);

        return displacement;
    }
}

var AsymLambWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);

    this.waveOrigin = this.dimensions.height / 2.0;
    this.modelDimensions = {
        width: this.modelDimensions.width,
        height: this.modelDimensions.height / 2.0,
    };
    this.modelOrigin = {
        x: this.modelOrigin.x,
        y: this.waveOrigin - this.modelDimensions.height / 2.0
    };

    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var lambAmplitude = params.lambAmplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var phi = coord[X_INDEX] * scale - time * timeScale;

        var distance = lambAmplitude * (this.waveOrigin - coord[Y_INDEX]);
        var theta = Math.sin(phi);

        displacement[X_INDEX] = distance * Math.sin(theta);
        displacement[Y_INDEX] = distance * Math.cos(theta) + amplitude * Math.cos(phi);

        return displacement;
    }

    /*
     * Re-initialize coordinate system after changing modelDimensions and modelOrigin
     */
    this.init();
}

var SymLambWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);

    this.waveOrigin = this.dimensions.height / 2.0;
    this.modelDimensions = {
        width: this.modelDimensions.width,
        height: this.modelDimensions.height / 2.0,
    };
    this.modelOrigin = {
        x: this.modelOrigin.x,
        y: this.waveOrigin - this.modelDimensions.height / 2.0,
    };

    this.getDisplacement = function(displacement, coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var phi = coord[X_INDEX] * scale - time * timeScale;
        var distance = (this.waveOrigin - coord[Y_INDEX]) / (this.modelDimensions.height / 2.0);

        displacement[X_INDEX] = amplitude * Math.cos(distance) * Math.sin(phi);
        displacement[Y_INDEX] = amplitude * distance * Math.cos(phi);

        return displacement;
    }

    /*
     * Re-initialize coordinate system after changing modelDimensions and modelOrigin
     */
    this.init();
}
