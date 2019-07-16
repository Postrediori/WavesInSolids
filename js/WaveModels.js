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
            x: coord.x,
            y: coord.y,
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
    this.horizontalCoords = new Array(this.horizontalLines);
    this.verticalCoords = new Array(this.verticalLines);

    this.init = function() {
        var dX = this.modelDimensions.width / (this.pointsCount - 1);
        var dY = this.modelDimensions.height / (this.horizontalLines - 1);
        for (var j = 0; j < this.horizontalLines; j++) {
            this.horizontalCoords[j] = new Array(this.pointsCount);
            var pointY0 = j * dY + this.modelOrigin.y;
            for (var i = 0; i<this.pointsCount; i++) {
                var pointX0 = i * dX + this.modelOrigin.x;
                this.horizontalCoords[j][i] = {
                    x0: pointX0,
                    y0: pointY0,
                    x: 0,
                    y: 0,
                };
            }
        }
        
        var dX = this.modelDimensions.width / (this.verticalLines - 1);
        var dY = this.modelDimensions.height / (this.pointsCount - 1);
        for (var j = 0; j < this.verticalLines; j++) {
            this.verticalCoords[j] = new Array(this.pointsCount);
            var pointX0 = j * dX + this.modelOrigin.x;
            for (var i = 0; i<this.pointsCount; i++) {
                var pointY0 = i * dY + this.modelOrigin.y;
                this.verticalCoords[j][i] = {
                    x0: pointX0,
                    y0: pointY0,
                    x: 0,
                    y: 0,
                };
            }
        }
    }

    this.getDisplacement = function(coord, time) {
        return {
            x: coord.x,
            y: coord.y,
        };
    }
    
    this.updateHorizontal = function(time) {
        for (var j = 0; j < this.horizontalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                var point = this.horizontalCoords[j][i];
                
                var displacement = this.getDisplacement({x:point.x0, y:point.y0}, time);
                
                point.x = point.x0 + displacement.x;
                point.y = point.y0 + displacement.y;
                this.horizontalCoords[j][i] = point;
            }
        }
    }

    this.updateVertical = function(time) {
        for (var j = 0; j < this.verticalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                var point = this.verticalCoords[j][i];
                
                var displacement = this.getDisplacement({x:point.x0, y:point.y0}, time);
                
                point.x = point.x0 + displacement.x;
                point.y = point.y0 + displacement.y;
                this.verticalCoords[j][i] = point;
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
    
    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        return {
            x: 0,
            y: amplitude * Math.sin(coord.x * scale - time * timeScale),
        };
    }
}

var PWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        return {
            x: amplitude * Math.cos(coord.x * scale - time * timeScale),
            y: 0,
        };
    }
}

var RadialPWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveOrigin = {
        x: this.dimensions.width / 2.0,
        y: this.dimensions.height / 2.0,
    };
     
    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var radialCoords = CartesianToRadial(coord, this.waveOrigin);
        
        var q = radialCoords.r * scale - time * timeScale;
        
        return {
            x: amplitude * Math.cos(radialCoords.theta) * Math.cos(q),
            y: amplitude * Math.sin(radialCoords.theta) * Math.cos(q),
        };
    }
}

var RadialSWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveOrigin = {
        x: this.dimensions.width / 2.0,
        y: this.dimensions.height / 2.0,
    };
     
    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var radialCoords = CartesianToRadial(coord, this.waveOrigin);
        var deltaOrigin = {
            x: this.waveOrigin.x - coord.x,
            y: this.waveOrigin.y - coord.y,
        };
        
        var q = scale * radialCoords.r - time * timeScale;
        var theta = radialCoords.theta + amplitude / radialCoords.r * Math.cos(q);
        
        return {
            x: deltaOrigin.x + radialCoords.r * Math.cos(theta),
            y: deltaOrigin.y + radialCoords.r * Math.sin(theta),
        };
    }
}

var RayleighWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.modelDepth = this.modelDimensions.height;
    this.modelTop = this.modelOrigin.y;
     
    this.getDisplacement = function(coord, time) {
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        // Horizontal and vertical amplitudes
        // are calculated as catheti of a right triangle
        // with amplitude as a hypothenuse.
        // TODO: Adjust two amplitudes independently.
        var amplitude = {
            x: params.amplitude / Math.sqrt(2.0),
            y: params.amplitude / Math.sqrt(2.0),
        };
        
        // Depth of a point
        var currentDepth = coord.y - this.modelTop;
        
        var currentAmplitude = {
            // Horizontal amplitude is a cosine function.
            // X Amplitude = max at the top and 0 at the bottom
            x: amplitude.x * Math.exp(-currentDepth / this.modelDepth),

            // Vertical amplitude is a linear function.
            y: amplitude.y * (1.0 - currentDepth / this.modelDepth),
        };
        
        var phi = coord.x * scale - time * timeScale;
        
        return {
            x: currentAmplitude.x * Math.cos(phi),
            y: currentAmplitude.y * Math.sin(phi),
        };
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

    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var lambAmplitude = params.lambAmplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var phi = coord.x * scale - time * timeScale;

        var distance = lambAmplitude * (this.waveOrigin - coord.y);
        var theta = Math.sin(phi);

        return {
            x: distance * Math.sin(theta),
            y: distance * Math.cos(theta) + amplitude * Math.cos(phi),
        };
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

    this.getDisplacement = function(coord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var phi = coord.x * scale - time * timeScale;
        var distance = (this.waveOrigin - coord.y) / (this.modelDimensions.height / 2.0);

        return {
            x: amplitude * Math.cos(distance) * Math.sin(phi),
            y: amplitude * distance * Math.cos(phi),
        };
    }

    /*
     * Re-initialize coordinate system after changing modelDimensions and modelOrigin
     */
    this.init();
}
