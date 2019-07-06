
window.onload = function() {
    var canvas = document.getElementById("canvas");
    var canvasSize = canvas.getBoundingClientRect();

    var modelParamsForm = document.getElementById("model-params").elements;
    var modelParams = new ModelParameters(modelParamsForm);
    
    var pWaveModel = new PWaveModel(modelParams, canvasSize);
    var sWaveModel = new SWaveModel(modelParams, canvasSize);
    var radialPWaveModel = new RadialPWaveModel(modelParams, canvasSize);
    var radialSWaveModel = new RadialSWaveModel(modelParams, canvasSize);
    var rayleighWaveModel = new RayleighWaveModel(modelParams, canvasSize);
    var model = pWaveModel;
    
    function initSvgPoints(params) {
        var svgVerticalLines = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svgVerticalLines.setAttribute('id', 'vertical-lines');

        for (var j = 0; j < params.verticalLines; j++) {
            for (var i = 0; i < params.pointsCount - 1; i++) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', '0');
                el.setAttribute('y1', '0');
                el.setAttribute('x2', '0');
                el.setAttribute('y2', '0');
                el.setAttribute('class', 'vertical-line');
                el.setAttribute('id', 'vertical-line-' + j.toString() + '-' + i.toString());
                svgVerticalLines.appendChild(el);
            }
        }
        canvas.appendChild(svgVerticalLines);

        var svgHorizontalLines = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svgHorizontalLines.setAttribute('id', 'vertical-lines');

        for (var j = 0; j < params.horizontalLines; j++) {
            for (var i = 0; i < params.pointsCount - 1; i++) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', '0');
                el.setAttribute('y1', '0');
                el.setAttribute('x2', '0');
                el.setAttribute('y2', '0');
                el.setAttribute('class', 'horizontal-line');
                el.setAttribute('id', 'horizontal-line-' + j.toString() + '-' + i.toString());
                svgHorizontalLines.appendChild(el);
            }
        }

        canvas.appendChild(svgHorizontalLines);

    }

    function updateSvgPoints(params, model) {
        for (var j = 0; j < params.horizontalLines; j++) {
            for (var i = 0; i < params.pointsCount - 1; i++) {
                var point1 = model.horizontalCoords[j][i];
                var point2 = model.horizontalCoords[j][i + 1];

                var el = document.getElementById('horizontal-line-'
                    + j.toString() + '-' + i.toString());
                el.setAttribute('x1', point1.x.toString());
                el.setAttribute('y1', point1.y.toString());
                el.setAttribute('x2', point2.x.toString());
                el.setAttribute('y2', point2.y.toString());
            }
        }
        
        for (var j = 0; j < params.verticalLines; j++) {
            for (var i = 0; i < params.pointsCount - 1; i++) {
                var point1 = model.verticalCoords[j][i];
                var point2 = model.verticalCoords[j][i + 1];

                var el = document.getElementById('vertical-line-'
                    + j.toString() + '-' + i.toString());
                el.setAttribute('x1', point1.x.toString());
                el.setAttribute('y1', point1.y.toString());
                el.setAttribute('x2', point2.x.toString());
                el.setAttribute('y2', point2.y.toString());
            }
        }
    }

    /*
     * Main functions
     */
    function init() {
        initSvgPoints(modelParams);
    }

    function update() {
        model.update(Date.now());
        updateSvgPoints(modelParams, model);

        setTimeout(update, 1000 / modelParams.fps);
    }

    function main() {
        init();

        update();
    }

    /*
     * Event listeners
     */
    var modelSwitchers = document.getElementsByClassName("model-switch");
    var modelInfoBlocks = document.getElementsByClassName("info-block");
    
    Array.from(modelSwitchers).forEach(function(element) {
        element.addEventListener('click', modelSwitchListener);
    });
    
    function modelSwitchListener(e) {
        Array.from(modelSwitchers).forEach(function(element) {
            element.classList.remove('selected-button');
        });
        e.target.classList.add('selected-button');
        
        Array.from(modelInfoBlocks).forEach(function(element) {
            element.classList.add('hidden-block');
        });
        
        var modelId = e.target.getAttribute('href').substring(1);
        setModel(modelId);
        
        var infoBlock = document.getElementById(modelId + '-info');
        infoBlock.classList.remove('hidden-block');
    }
    
    function setModel(modelId) {
        if (modelId === "pwave") {
            model = pWaveModel;
            
        } else if (modelId === "swave") {
            model = sWaveModel;
            
        } else if (modelId === "radialpwave") {
            model = radialPWaveModel;
            
        } else if (modelId === "radialswave") {
            model = radialSWaveModel;
            
        } else if (modelId === "rayleighwave") {
            model = rayleighWaveModel;
            
        }
    }
    
    /*
     * Execute main function
     */
    main();

}
