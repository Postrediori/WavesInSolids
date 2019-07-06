
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
        for (var j = 0; j < this.horizontalLines; j++) {
            this.horizontalCoords[j] = new Array(this.pointsCount);
            for (var i = 0; i<this.pointsCount; i++) {
                this.horizontalCoords[j][i] = {x:0, y:0};
            }
        }
        for (var j = 0; j < this.verticalLines; j++) {
            this.verticalCoords[j] = new Array(this.pointsCount);
            for (var i = 0; i<this.pointsCount; i++) {
                this.verticalCoords[j][i] = {x:0, y:0};
            }
        }
    }

    this.updateHorizontal = function(time) { }

    this.updateVertical = function(time) { }
    
    this.update = function(time) {
        this.updateHorizontal(time);
        this.updateVertical(time);
    }
    
    this.init();
}

SWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.updateHorizontal = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var dX = this.modelDimensions.width / (this.pointsCount - 1);
        var dY = this.modelDimensions.height / (this.horizontalLines - 1);

        for (var j = 0; j < this.horizontalLines; j++) {
            var pointY0 = j * dY + this.modelOrigin.y;
            for (var i = 0; i < this.pointsCount; i++) {
                var pointX0 = i * dX + this.modelOrigin.x;
                
                var pointX = pointX0;
                var pointY = pointY0
                    + amplitude * Math.sin(pointX * scale - time * timeScale);
                this.horizontalCoords[j][i] = {x:pointX, y:pointY};
            }
        }
    }

    this.updateVertical = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var dX = this.modelDimensions.width / (this.verticalLines - 1);
        var dY = this.modelDimensions.height / (this.pointsCount - 1);

        for (var j = 0; j < this.verticalLines; j++) {
            var pointX0 = j * dX + this.modelOrigin.x;
            for (var i = 0; i < this.pointsCount; i++) {
                var pointY0 = i * dY + this.modelOrigin.y;
                
                var pointX = pointX0;
                var pointY = pointY0
                    + amplitude * Math.sin(pointX * scale - time * timeScale);
                this.verticalCoords[j][i] = {x:pointX, y:pointY};
            }
        }
    }
}

PWaveModel = function(params, dimensions) {
    Model.call(this, params, dimensions);
    
    this.updateHorizontal = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var dX = this.modelDimensions.width / (this.pointsCount - 1);
        var dY = this.modelDimensions.height / (this.horizontalLines - 1);

        for (var j = 0; j < this.horizontalLines; j++) {
            var pointY0 = j * dY + this.modelOrigin.y;
            for (var i = 0; i < this.pointsCount; i++) {
                var pointX0 = i * dX + this.modelOrigin.x;
                
                var pointX = pointX0
                    + amplitude * Math.cos(pointX0 * scale - time * timeScale);
                var pointY = pointY0;
                this.horizontalCoords[j][i] = {x:pointX, y:pointY};
            }
        }
    }

    this.updateVertical = function(time) {
        var amplitude = params.amplitude;
        var scale = params.scale;
        var timeScale = params.timeScale;

        var dX = this.modelDimensions.width / (this.verticalLines - 1);
        var dY = this.modelDimensions.height / (this.pointsCount - 1);

        for (var j = 0; j < this.verticalLines; j++) {
            var pointX0 = j * dX + this.modelOrigin.x;
            for (var i = 0; i < this.pointsCount; i++) {
                var pointY0 = i * dY + this.modelOrigin.y;
                
                var pointX = pointX0
                    + amplitude * Math.cos(pointX0 * scale - time * timeScale);
                var pointY = pointY0;
                this.verticalCoords[j][i] = {x:pointX, y:pointY};
            }
        }
    }
}
