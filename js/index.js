
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
    var asymLambWaveModel = new AsymLambWaveModel(modelParams, canvasSize);
    var symLambWaveModel = new SymLambWaveModel(modelParams, canvasSize);

    var model = pWaveModel;
    
    var markerPos = {
        dataSet: 'horizontal',
        i: Math.floor(model.pointsCount / 2),
        j: 0
    };
    var markerHistory = new MarkerHistory(modelParams.markerHistoryLen);
    
    /*
     * Set marker as nearest point to a specific coordinate
     */
    function setMarker(params, model, coord) {
        var flag = false;
        var nearestPoint = {
            dataSet: '',
            j: 0,
            i: 0,
            distance: 0
        };
        
        for (var j = 0; j < params.horizontalLines; j++) {
            for (var i = 0; i < params.pointsCount; i++) {
                var point = model.horizontalCoords[j][i];
                var distance = DistanceBetweenPoints(coord, point);
                    
                if (!flag) {
                    // First point
                    // Don't compare minimum distance, only fill nearest point
                    
                    nearestPoint.dataSet = 'horizontal';
                    nearestPoint.j = j;
                    nearestPoint.i = i;
                    nearestPoint.distance = distance;
                    
                    flag = true;
                    continue;
                }
                
                if (distance < nearestPoint.distance) {
                    nearestPoint.dataSet = 'horizontal';
                    nearestPoint.j = j;
                    nearestPoint.i = i;
                    nearestPoint.distance = distance;
                }
            }
        }
        
        for (var j = 0; j < params.verticalLines; j++) {
            for (var i = 0; i < params.pointsCount; i++) {
                var point = model.verticalCoords[j][i];
                var distance = DistanceBetweenPoints(coord, point);
                
                if (distance < nearestPoint.distance) {
                    nearestPoint.dataSet = 'vertical';
                    nearestPoint.j = j;
                    nearestPoint.i = i;
                    nearestPoint.distance = distance;
                }
            }
        }
        
        markerPos.dataSet = nearestPoint.dataSet;
        markerPos.j = nearestPoint.j;
        markerPos.i = nearestPoint.i;
    }
    
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

        // Create marker history
        var svgMarkers = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svgMarkers.setAttribute('id', 'markers');

        for (var i = 0; i < markerHistory.historyLen; i++) {
            var el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            el.setAttribute('x1', '0');
            el.setAttribute('y1', '0');
            el.setAttribute('x2', '0');
            el.setAttribute('y2', '0');
            el.setAttribute('opacity', (i / markerHistory.historyLen).toString());
            el.setAttribute('class', 'marker-history-line');
            el.setAttribute('id', 'marker-history-line-' + i.toString());
            svgMarkers.appendChild(el);
        }

        // Create marker
        var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        el.setAttribute('cx', '0');
        el.setAttribute('cy', '0');
        el.setAttribute('r', '5');
        el.setAttribute('class', 'marker');
        el.setAttribute('id', 'marker-0');
        svgMarkers.appendChild(el);

        canvas.appendChild(svgMarkers);
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

        // Update marker
        var markerPoint = markerPos.dataSet === 'horizontal' ?
            model.horizontalCoords[markerPos.j][markerPos.i] :
            model.verticalCoords[markerPos.j][markerPos.i];
        var el = document.getElementById('marker-0');
        el.setAttribute('cx', markerPoint.x.toString());
        el.setAttribute('cy', markerPoint.y.toString());

        // Update marker history
        for (var i = 0; i < markerHistory.historyLen - 1; i++) {
            var el = document.getElementById('marker-history-line-' + i.toString());

            if (markerHistory.hasHistory(i)) {
                el.setAttribute('visibility', 'visible');
            } else {
                el.setAttribute('visibility', 'hidden');
            }
            var line = markerHistory.getHistory(i);

            el.setAttribute('x1', line.x1.toString());
            el.setAttribute('y1', line.y1.toString());
            el.setAttribute('x2', line.x2.toString());
            el.setAttribute('y2', line.y2.toString());
        }
    }

    /*
     * Main functions
     */
    function init() {
        initSvgPoints(modelParams);
    }

    var lastTime = (new Date()).getTime();
    var render = function render (currentTime) {
        var deltaTime = (currentTime - lastTime) / 1000 || 0.0;
        lastTime = currentTime;

        // Update model
        model.update(deltaTime);

        // Update markey point and history
        var markerPoint = markerPos.dataSet === 'horizontal' ?
            model.horizontalCoords[markerPos.j][markerPos.i] :
            model.verticalCoords[markerPos.j][markerPos.i];
        markerHistory.push(markerPoint);

        // Update SVG
        updateSvgPoints(modelParams, model);

        requestAnimationFrame(render);
    };

    function main() {
        init();

        render();
    }

    /*
     * Event listeners
     */    
    var modelSwitchers = document.getElementsByClassName("model-switch");
    var modelInfoBlocks = document.getElementsByClassName("info-block");
    
    function applyHashChange() {
        var modelId = window.location.hash.substr(1)
        setModel(modelId)
    }

    if (window.location.hash.length > 0) {
        applyHashChange()
    }

    window.addEventListener("hashchange", applyHashChange, false);

    function setModel(modelId) {
        if (modelId === "pwave") {
            model = pWaveModel;
        }
        else if (modelId === "swave") {
            model = sWaveModel;
        }
        else if (modelId === "radialpwave") {
            model = radialPWaveModel;
        }
        else if (modelId === "radialswave") {
            model = radialSWaveModel;
        }
        else if (modelId === "rayleighwave") {
            model = rayleighWaveModel;
        }
        else if (modelId === "asymlambwave") {
            model = asymLambWaveModel;
        }
        else if (modelId === "symlambwave") {
            model = symLambWaveModel;
        }
        else {
            // Default model for unknown links
            model = pWaveModel;
            modelId = "pwave";
        }

        uiModelSwitch(modelId);

        markerHistory.clear();
    }
    
    function uiModelSwitch(modelId) {
        Array.from(modelSwitchers).forEach(function(element) {
            if (element.getAttribute('href') === '#'+modelId) {
                element.classList.add('selected-button');
            }
            else {
                element.classList.remove('selected-button');
            }
        });
        
        Array.from(modelInfoBlocks).forEach(function(element) {
            element.classList.add('hidden-block');
        });
        
        var infoBlock = document.getElementById(modelId + '-info');
        infoBlock.classList.remove('hidden-block');
    }
    
    function onCanvasMouseDown(evt) {
        var x = evt.clientX - canvasSize.left;
        var y = evt.clientY - canvasSize.top;
        setMarker(modelParams, model, {x: x, y: y});
        markerHistory.clear();
    }
    
    canvas.addEventListener('mousedown', onCanvasMouseDown, false);
    
    /*
     * Execute main function
     */
    main();

}
