
function CartesianToRadial(coord, origin) {
    var dX = coord.x - origin.x;
    var dY = coord.y - origin.y;
    
    var theta = Math.atan2(dY, dX);
    var r = Math.sqrt(dX * dX + dY * dY);
    
    return {theta: theta, r: r};
}

ModelParameters = function(data) {
    this.fps = parseInt(data["fps"].value);
    this.pointsCount = parseInt(data["points-count"].value);
    this.horizontalLines = parseInt(data["horizontal-lines"].value);
    this.verticalLines = parseInt(data["vertical-lines"].value);
    this.amplitude = parseFloat(data["amplitude"].value);
    this.scale = parseFloat(data["scale"].value);
    this.timeScale = parseFloat(data["time-scale"].value);
}

Model = function(params, dimensions) {
    this.params = params;
    this.dimensions = dimensions;
    this.modelDimensions =
        {width: this.dimensions.width * 0.85, height: this.dimensions.height * 0.85};
    this.modelOrigin =
        {x: (this.dimensions.width - this.modelDimensions.width) / 2.0,
         y: (this.dimensions.height - this.modelDimensions.height) / 2.0};
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
                this.horizontalCoords[j][i] = {x0:pointX0, y0:pointY0, x:0, y:0};
            }
        }
        
        var dX = this.modelDimensions.width / (this.verticalLines - 1);
        var dY = this.modelDimensions.height / (this.pointsCount - 1);
        for (var j = 0; j < this.verticalLines; j++) {
            this.verticalCoords[j] = new Array(this.pointsCount);
            var pointX0 = j * dX + this.modelOrigin.x;
            for (var i = 0; i<this.pointsCount; i++) {
                var pointY0 = i * dY + this.modelOrigin.y;
                this.verticalCoords[j][i] = {x0:pointX0, y0:pointY0, x:0, y:0};
            }
        }
    }

    this.movePoint = function(pointCoord, time) {
        return {
            x: pointCoord.x0,
            y: pointCoord.y0,
        };
    }
    
    this.updateHorizontal = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        for (var j = 0; j < this.horizontalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                var point = this.horizontalCoords[j][i];
                
                var newCoord = this.movePoint({x:point.x0, y:point.y0}, time);
                
                point.x = newCoord.x;
                point.y = newCoord.y;
                this.horizontalCoords[j][i] = point;
            }
        }
    }

    this.updateVertical = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        for (var j = 0; j < this.verticalLines; j++) {
            for (var i = 0; i < this.pointsCount; i++) {
                var point = this.verticalCoords[j][i];
                
                var newCoord = this.movePoint({x:point.x0, y:point.y0}, time);
                
                point.x = newCoord.x;
                point.y = newCoord.y;
                this.verticalCoords[j][i] = point;
            }
        }
    }
    
    this.update = function(time) {
        this.updateHorizontal(time);
        this.updateVertical(time);
    }
    
    this.init();
}

SWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.movePoint = function(pointCoord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        return {
            x: pointCoord.x,
            y: pointCoord.y + amplitude * Math.sin(pointCoord.x * scale - time * timeScale),
        };
    }
}

PWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.movePoint = function(pointCoord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        return {
            x: pointCoord.x + amplitude * Math.cos(pointCoord.x * scale - time * timeScale),
            y: pointCoord.y,
        };
    }
}

RadialPWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveCenter =
        {x: this.dimensions.width / 2.0,
         y: this.dimensions.height / 2.0};
     
    this.movePoint = function(pointCoord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var radialCoords = CartesianToRadial(pointCoord, this.waveCenter);
        
        var q = radialCoords.r * scale - time * timeScale;
        
        return {
            x: pointCoord.x + amplitude * Math.cos(radialCoords.theta) * Math.cos(q),
            y: pointCoord.y + amplitude * Math.sin(radialCoords.theta) * Math.cos(q),
        };
    }
}

RadialSWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.waveCenter =
        {x: this.dimensions.width / 2.0,
         y: this.dimensions.height / 2.0};
     
    this.movePoint = function(pointCoord, time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;
        
        var radialCoords = CartesianToRadial(pointCoord, this.waveCenter);
        
        var q = scale * radialCoords.r - time * timeScale;
        var theta = radialCoords.theta + amplitude / radialCoords.r * Math.cos(q);
        
        return {
            x: this.waveCenter.x + radialCoords.r * Math.cos(theta),
            y: this.waveCenter.y + radialCoords.r * Math.sin(theta),
        };
    }
}
